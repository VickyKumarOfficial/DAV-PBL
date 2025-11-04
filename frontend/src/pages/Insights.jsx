import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

export const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, chartsData] = await Promise.all([
          api.getInsights(),
          api.listCharts(),
        ]);
        setInsights(insightsData);
        setCharts(chartsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start space-x-3 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900 dark:text-red-100">Error Loading Insights</p>
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  const { model_metrics, feature_importance, dataset_info } = insights || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Model Insights & Analytics</h1>
        <p className="text-muted-foreground">
          Explore model performance metrics, feature importance, and dataset statistics.
        </p>
      </div>

      {/* Model Performance Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Model Performance</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ROC-AUC Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {(model_metrics?.roc_auc * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Test Set Performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                F1 Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {(model_metrics?.f1_score * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Classification Accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CV Mean AUC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {(model_metrics?.cv_roc_auc_mean * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">5-Fold Cross-Validation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CV Std Dev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ±{(model_metrics?.cv_roc_auc_std * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Model Stability</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Importance Chart */}
      {feature_importance && feature_importance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Features by Importance</CardTitle>
            <CardDescription>
              Features that have the most influence on treatment prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={feature_importance.slice(0, 15).map((f) => ({
                  name: f.feature.replace(/_/g, ' '),
                  importance: f.importance,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => value.toFixed(4)}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="importance" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Dataset Statistics */}
      {dataset_info && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Dataset Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Samples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dataset_info.total_samples?.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Seeking Treatment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {dataset_info.treatment_yes}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(dataset_info.treatment_rate * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Not Seeking Treatment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {dataset_info.treatment_no}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((1 - dataset_info.treatment_rate) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Countries Represented
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {dataset_info.countries}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {dataset_info.avg_age?.toFixed(1)} years
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tech Industry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-600">
                  {(dataset_info.tech_companies_pct * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">from tech companies</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EDA Visualizations */}
      {charts && charts.charts && charts.charts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Exploratory Data Analysis Charts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {charts.charts.map((chart) => (
              <Card key={chart} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {chart.replace(/^\d+_/, '').replace(/_/g, ' ').replace('.png', '')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={api.getChartUrl(chart)}
                    alt={chart}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
