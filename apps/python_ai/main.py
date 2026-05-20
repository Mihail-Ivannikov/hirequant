import logging
import re
import math
import sys
from typing import List, Set, Tuple, Dict, Optional
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
import spacy
import warnings

warnings.filterwarnings("ignore")


class CustomFormatter(logging.Formatter):
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s | AI_ENGINE | %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: blue + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt="%H:%M:%S")
        return formatter.format(record)

logger = logging.getLogger("StrictSemanticTensorEngine")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler(sys.stdout)
ch.setFormatter(CustomFormatter())
logger.addHandler(ch)
logger.propagate = False

torch.set_num_threads(1)

app = FastAPI(title="Strict HR AI Engine", version="6.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class AnalyzeRequest(BaseModel):
    resume_text: Optional[str] = Field(default="")
    cv_text: Optional[str] = Field(default="")
    resumeText: Optional[str] = Field(default="")
    
    vacancy_text: Optional[str] = Field(default="")
    vacancyText: Optional[str] = Field(default="")
    
    vacancy_skills: Optional[List[str]] = Field(default=[])
    vacancySkills: Optional[List[str]] = Field(default=[])
    master_skills: Optional[List[str]] = Field(default=[])

    def get_resume(self) -> str:
        return self.resume_text or self.cv_text or self.resumeText or ""
        
    def get_vacancy(self) -> str:
        return self.vacancy_text or self.vacancyText or ""
        
    def get_skills(self) -> List[str]:
        return self.vacancy_skills or self.vacancySkills or self.master_skills or[]

@dataclass
class TensorPayload:
    embeddings: torch.Tensor
    sentence_count: int

class AnalyzeResponse(BaseModel):
    extracted_skills: List[str]
    ai_score: int

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error("422 UNPROCESSABLE ENTITY TRIGGERED")
    logger.error(f"FastAPI rejected the payload. Issue: {exc.errors()}")
    try:
        body = await request.body()
        logger.error(f"Raw data received from NestJS: {body.decode('utf-8')[:1000]}")
    except Exception:
        pass
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

class SemanticMathEngine:
    def __init__(self, model_name: str = 'sentence-transformers/all-MiniLM-L6-v2'):
        logger.info(f"Loading Neural Architecture: {model_name}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            self.model.eval()
            
            self.nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])
            self.nlp.add_pipe("sentencizer")
            
            self.SEMANTIC_INFERENCE_THRESHOLD = 0.85 
            logger.info("Mathematical Tensor Engine Initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize AI Engine: {str(e)}")
            raise

    def _clean_and_chunk_text(self, text: str) -> List[str]:
        if not text or not text.strip():
            return[]
            
        clean_text = re.sub(r'\s+', ' ', text).strip()
        
        try:
            doc = self.nlp(clean_text)
            sentences =[sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 10]
        except Exception as e:
            logger.warning(f"SpaCy splitting failed ({str(e)}), falling back to Regex.")
            sentences =[s.strip() for s in re.split(r'[.!?\n]', clean_text) if len(s.strip()) > 10]
            
        if not sentences and len(clean_text) > 0:
            sentences =[clean_text]
            
        return sentences

    def _build_strict_regex(self, skill: str) -> str:
        escaped_skill = re.escape(skill)
        left_boundary = r'(?:^|[^\w])'
        right_boundary = r'(?:[^\w]|$)'
        return f'(?i){left_boundary}{escaped_skill}{right_boundary}'

    def _mean_pooling(self, model_output: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        token_embeddings = model_output[0] 
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask

    def get_embeddings(self, sentences: List[str], batch_size: int = 4) -> TensorPayload:
        if not sentences:
            return TensorPayload(embeddings=torch.empty((0, 384)), sentence_count=0)
        all_embeddings =[]
        for i in range(0, len(sentences), batch_size):
            batch = sentences[i : i + batch_size]
            encoded_input = self.tokenizer(batch, padding=True, truncation=True, return_tensors='pt', max_length=512)
            with torch.no_grad():
                model_output = self.model(**encoded_input)
            sentence_embeddings = self._mean_pooling(model_output, encoded_input['attention_mask'])
            normalized_embeddings = F.normalize(sentence_embeddings, p=2, dim=1) 
            all_embeddings.append(normalized_embeddings)
        return TensorPayload(embeddings=torch.cat(all_embeddings, dim=0), sentence_count=len(sentences))

    def compute_similarity_matrix(self, vectors_a: torch.Tensor, vectors_b: torch.Tensor) -> torch.Tensor:
        if vectors_a.size(0) == 0 or vectors_b.size(0) == 0:
            return torch.empty(0)
        return torch.mm(vectors_a, vectors_b.transpose(0, 1))

    def extract_skills(self, cv_text: str, cv_sentences: List[str], cv_embeddings: torch.Tensor, vacancy_skills: List[str]) -> Tuple[Set[str], Dict[str, str]]:
        explicit_extracted = set()
        semantic_extracted = {}
        if not vacancy_skills or cv_embeddings.size(0) == 0:
            return explicit_extracted, semantic_extracted

        cv_clean_lower = cv_text.lower()
        skills_payload = self.get_embeddings(vacancy_skills)
        similarity_matrix = self.compute_similarity_matrix(skills_payload.embeddings, cv_embeddings)
        
        for i, skill in enumerate(vacancy_skills):
            regex_pattern = self._build_strict_regex(skill)
            if re.search(regex_pattern, cv_clean_lower):
                explicit_extracted.add(skill)
                continue
                
            best_semantic_score = torch.max(similarity_matrix[i]).item()
            best_sentence_idx = torch.argmax(similarity_matrix[i]).item()
            
            if best_semantic_score >= self.SEMANTIC_INFERENCE_THRESHOLD: 
                semantic_extracted[skill] = f"{cv_sentences[best_sentence_idx]} (Score: {best_semantic_score:.2f})"
                
        return explicit_extracted, semantic_extracted

    def calculate_final_score(self, cv_embeddings: torch.Tensor, vacancy_embeddings: torch.Tensor, 
                              extracted_skills_count: int, total_required_skills: int) -> Tuple[int, float, float]:
        similarity_matrix = self.compute_similarity_matrix(vacancy_embeddings, cv_embeddings)
        best_matches, _ = torch.max(similarity_matrix, dim=1) 
        raw_doc_similarity = torch.mean(best_matches).item()
        
        power = -30.0 * (raw_doc_similarity - 0.55)
        power = max(-50.0, min(50.0, power))
        semantic_percentage = (1.0 / (1.0 + math.exp(power))) * 100.0

        if total_required_skills > 0:
            skill_percentage = (extracted_skills_count / total_required_skills) * 100.0
            final_score = (skill_percentage * 0.70) + (semantic_percentage * 0.30)
        else:
            final_score = semantic_percentage

        if total_required_skills > 0 and extracted_skills_count == 0:
            final_score = 0.0

        return max(0, min(100, int(round(final_score)))), raw_doc_similarity, semantic_percentage

ai_engine = SemanticMathEngine()

@app.get("/health", status_code=200)
def health_check():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(request: AnalyzeRequest):
    try:
        safe_resume = request.get_resume()
        safe_vacancy = request.get_vacancy()
        safe_skills = request.get_skills()

        cv_sentences = ai_engine._clean_and_chunk_text(safe_resume)
        vacancy_sentences = ai_engine._clean_and_chunk_text(safe_vacancy)
        
        if not cv_sentences or not vacancy_sentences:
            logger.warning("Warning: Empty text received (Could be a failed PDF read). Returning 0%.")
            return AnalyzeResponse(extracted_skills=[], ai_score=0)

        cv_payload = ai_engine.get_embeddings(cv_sentences)
        vacancy_payload = ai_engine.get_embeddings(vacancy_sentences)

        explicit_skills, semantic_skills_dict = ai_engine.extract_skills(
            safe_resume, cv_sentences, cv_payload.embeddings, safe_skills
        )
        
        all_extracted = set(explicit_skills).union(set(semantic_skills_dict.keys()))
        missing_skills = [s for s in safe_skills if s not in all_extracted]

        final_score, raw_doc, sem_pct = ai_engine.calculate_final_score(
            cv_payload.embeddings, vacancy_payload.embeddings, 
            len(all_extracted), len(safe_skills)
        )

        logger.info("=" * 80)
        logger.info("NEW AI VECTOR ANALYSIS INITIATED")
        logger.info(f"Target Vacancy Skills : {safe_skills}")
        logger.info("-" * 80)
        logger.info("SKILL EXTRACTION RESULTS:")
        
        if explicit_skills:
            logger.info(f"Explicitly Matched  : {list(explicit_skills)}")
        else:
            logger.info("Explicitly Matched  : None")
            
        if semantic_skills_dict:
            logger.info(f"Semantically Guessed:")
            for skill, reason in semantic_skills_dict.items():
                logger.info(f"    -> '{skill}' (Matched from: \"{reason}\")")
        else:
            logger.info("Semantically Guessed: None")
            
        logger.info(f"Missing Skills      : {missing_skills}")
        logger.info("-" * 80)
        logger.info("SCORING METRICS:")
        skill_ratio = (len(all_extracted) / len(safe_skills) * 100) if safe_skills else 0
        logger.info(f" -> Technical Skill Ratio: {skill_ratio:.2f}%")
        logger.info(f" -> Semantic Context Score: {sem_pct:.2f}% (Raw Matrix Peak: {raw_doc:.4f})")
        
        if len(safe_skills) > 0 and len(all_extracted) == 0:
            
            logger.warning("CV text shows ZERO technical relation to the required skills.")
            logger.warning("Applying MAXIMUM PENALTY -> Final Score locked to 0%.")
            
        logger.info(f"FINAL AI SCORE       : {final_score}%")
        logger.info("=" * 80)

        return AnalyzeResponse(
            extracted_skills=list(all_extracted),
            ai_score=final_score
        )

    except Exception as e:
        logger.error(f"FATAL Matrix Computation Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal AI Engine Error")
