"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class PredictionRequest(BaseModel):
    """Request schema for prediction endpoint"""
    Age: int = Field(..., ge=18, le=80, description="Age of the respondent")
    Gender: str = Field(..., description="Gender (Male/Female/Other/Non-binary/Transgender)")
    Country: str = Field(..., description="Country")
    self_employed: str = Field(..., description="Self-employed (Yes/No)")
    family_history: str = Field(..., description="Family history of mental health (Yes/No)")
    work_interfere: Optional[str] = Field("Never", description="Work interference level")
    no_employees: str = Field(..., description="Number of employees")
    remote_work: str = Field(..., description="Remote work (Yes/No)")
    tech_company: str = Field(..., description="Tech company (Yes/No)")
    benefits: str = Field(..., description="Benefits (Yes/No/Don't know)")
    care_options: str = Field(..., description="Care options (Yes/No/Don't know)")
    wellness_program: str = Field(..., description="Wellness program (Yes/No/Don't know)")
    seek_help: str = Field(..., description="Seek help resources (Yes/No)")
    anonymity: str = Field(..., description="Anonymity (Yes/No)")
    leave: str = Field(..., description="Ease of taking leave")
    mental_health_consequence: str = Field(..., description="Mental health consequence (Yes/No)")
    phys_health_consequence: str = Field(..., description="Physical health consequence (Yes/No)")
    coworkers: str = Field(..., description="Discuss with coworkers")
    supervisor: str = Field(..., description="Discuss with supervisor")
    mental_health_interview: str = Field(..., description="Mental health in interview")
    phys_health_interview: str = Field(..., description="Physical health in interview")
    mental_vs_physical: str = Field(..., description="Mental vs physical health")
    obs_consequence: str = Field(..., description="Observed consequences (Yes/No)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Age": 30,
                "Gender": "Male",
                "Country": "United States",
                "self_employed": "No",
                "family_history": "Yes",
                "work_interfere": "Sometimes",
                "no_employees": "26-100",
                "remote_work": "Yes",
                "tech_company": "Yes",
                "benefits": "Yes",
                "care_options": "Yes",
                "wellness_program": "No",
                "seek_help": "Yes",
                "anonymity": "Yes",
                "leave": "Somewhat easy",
                "mental_health_consequence": "No",
                "phys_health_consequence": "No",
                "coworkers": "Some of them",
                "supervisor": "Yes",
                "mental_health_interview": "No",
                "phys_health_interview": "Maybe",
                "mental_vs_physical": "Yes",
                "obs_consequence": "No"
            }
        }


class TopFactor(BaseModel):
    """Schema for top contributing factor"""
    feature: str
    impact: float
    direction: str


class PredictionResponse(BaseModel):
    """Response schema for prediction endpoint"""
    prediction: str = Field(..., description="Predicted outcome (Yes/No)")
    probability: Dict[str, float] = Field(..., description="Probability scores")
    confidence: str = Field(..., description="Confidence level (High/Medium/Low)")
    top_factors: List[TopFactor] = Field(..., description="Top contributing factors")


class FeatureImportance(BaseModel):
    """Schema for feature importance"""
    rank: int
    feature: str
    importance: float


class ModelMetrics(BaseModel):
    """Schema for model performance metrics"""
    roc_auc: float
    f1_score: float
    cv_roc_auc_mean: float
    cv_roc_auc_std: float


class InsightsResponse(BaseModel):
    """Response schema for insights endpoint"""
    model_metrics: ModelMetrics
    feature_importance: List[FeatureImportance]
    dataset_info: Dict[str, float | int | str]


class HealthResponse(BaseModel):
    """Response schema for health check"""
    status: str
    message: str
    version: str
