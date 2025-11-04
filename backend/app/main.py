"""
FastAPI Main Application
Mental Health Treatment Predictor API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import joblib

from app.config import (API_TITLE, API_VERSION, API_DESCRIPTION, CORS_ORIGINS,
                        CHARTS_DIR, ARTIFACTS_DIR, PROCESSED_DATA_PATH)
from app.models import (PredictionRequest, PredictionResponse, InsightsResponse,
                        HealthResponse, FeatureImportance, ModelMetrics)
from app.predict import prediction_service

# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def root():
    """API root endpoint"""
    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "description": "Predict mental health treatment likelihood based on workplace and demographic factors",
        "endpoints": {
            "predict": "/predict (POST)",
            "insights": "/insights (GET)",
            "health": "/health (GET)",
            "charts": "/charts (GET)",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running successfully",
        "version": API_VERSION
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_treatment(request: PredictionRequest):
    """
    Predict likelihood of seeking mental health treatment
    
    **Input:** User demographics and workplace information
    
    **Output:** Prediction with probability scores and top contributing factors
    """
    try:
        # Convert request to dict
        input_data = request.model_dump()
        
        # Get prediction
        result = prediction_service.predict(input_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/insights", response_model=InsightsResponse, tags=["Model Insights"])
async def get_insights():
    """
    Get model performance metrics and feature importance
    
    **Output:** Model metrics, feature importance rankings, and dataset info
    """
    try:
        # Load metrics
        metrics_path = ARTIFACTS_DIR / 'metrics.joblib'
        metrics = joblib.load(metrics_path)
        
        # Get feature importance
        feature_importance = prediction_service.get_feature_importance(top_n=15)
        
        # Load dataset info
        import pandas as pd
        df = pd.read_csv(PROCESSED_DATA_PATH)
        
        dataset_info = {
            "total_samples": len(df),
            "treatment_yes": int((df['treatment'] == 'Yes').sum()),
            "treatment_no": int((df['treatment'] == 'No').sum()),
            "treatment_rate": float((df['treatment'] == 'Yes').sum() / len(df)),
            "features_used": len(prediction_service._feature_names),
            "countries": int(df['Country'].nunique()),
            "avg_age": float(df['Age'].mean()),
            "tech_companies_pct": float((df['tech_company'] == 'Yes').sum() / len(df))
        }
        
        return {
            "model_metrics": {
                "roc_auc": metrics['test_roc_auc'],
                "f1_score": metrics['test_f1'],
                "cv_roc_auc_mean": metrics['cv_roc_auc_mean'],
                "cv_roc_auc_std": metrics['cv_roc_auc_std']
            },
            "feature_importance": feature_importance,
            "dataset_info": dataset_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insights: {str(e)}")


@app.get("/charts", tags=["Visualizations"])
async def list_charts():
    """
    List all available EDA charts
    
    **Output:** List of chart filenames
    """
    try:
        charts = list(CHARTS_DIR.glob("*.png"))
        chart_names = [chart.name for chart in sorted(charts)]
        
        return {
            "total_charts": len(chart_names),
            "charts": chart_names,
            "base_url": "/charts/"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing charts: {str(e)}")


@app.get("/charts/{filename}", tags=["Visualizations"])
async def get_chart(filename: str):
    """
    Get a specific EDA chart image
    
    **Input:** Chart filename (e.g., '01_age_distribution.png')
    
    **Output:** PNG image file
    """
    try:
        chart_path = CHARTS_DIR / filename
        
        if not chart_path.exists():
            raise HTTPException(status_code=404, detail=f"Chart '{filename}' not found")
        
        if not filename.endswith('.png'):
            raise HTTPException(status_code=400, detail="Only PNG charts are supported")
        
        return FileResponse(chart_path, media_type="image/png")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving chart: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
