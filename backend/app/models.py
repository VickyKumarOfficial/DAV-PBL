"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class PredictionRequest(BaseModel):
    """Request schema for prediction endpoint - supports both full and simplified forms"""
    # Core fields (always required - in simplified 10-field form)
    Age: int = Field(..., ge=18, le=80, description="Age of the respondent")
    Gender: str = Field(..., description="Gender (Male/Female/Other)")
    Country: str = Field(..., description="Country")
    family_history: str = Field(..., description="Family history of mental health (Yes/No)")
    work_interfere: str = Field(..., description="Work interference level")
    benefits: str = Field(..., description="Benefits (Yes/No/Don't know)")
    care_options: str = Field(..., description="Care options (Yes/No/Don't know)")
    self_employed: str = Field(..., description="Self-employed (Yes/No)")
    obs_consequence: str = Field(..., description="Observed consequences (Yes/No)")
    leave: str = Field(..., description="Ease of taking leave")
    
    # Optional fields (will be filled with defaults by backend if not provided)
    no_employees: Optional[str] = Field(None, description="Number of employees")
    remote_work: Optional[str] = Field(None, description="Remote work (Yes/No)")
    tech_company: Optional[str] = Field(None, description="Tech company (Yes/No)")
    wellness_program: Optional[str] = Field(None, description="Wellness program (Yes/No/Don't know)")
    seek_help: Optional[str] = Field(None, description="Seek help resources (Yes/No)")
    anonymity: Optional[str] = Field(None, description="Anonymity (Yes/No)")
    mental_health_consequence: Optional[str] = Field(None, description="Mental health consequence (Yes/No)")
    phys_health_consequence: Optional[str] = Field(None, description="Physical health consequence (Yes/No)")
    coworkers: Optional[str] = Field(None, description="Discuss with coworkers")
    supervisor: Optional[str] = Field(None, description="Discuss with supervisor")
    mental_health_interview: Optional[str] = Field(None, description="Mental health in interview")
    phys_health_interview: Optional[str] = Field(None, description="Physical health in interview")
    mental_vs_physical: Optional[str] = Field(None, description="Mental vs physical health")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Age": 30,
                "Gender": "Male",
                "Country": "India",
                "family_history": "Yes",
                "work_interfere": "Sometimes",
                "benefits": "Yes",
                "care_options": "Yes",
                "self_employed": "No",
                "obs_consequence": "No",
                "leave": "Somewhat easy"
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
