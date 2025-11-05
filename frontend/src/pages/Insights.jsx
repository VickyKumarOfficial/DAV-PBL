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
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, chartsData] = await Promise.all([
          api.getInsights(),
          api.listCharts(),
        ]);
        setInsights(insightsData);
        setCharts(chartsData);
        
        // Load user's assessment data from localStorage
        const savedData = localStorage.getItem('userAssessmentData');
        if (savedData) {
          setUserData(JSON.parse(savedData));
        }
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

      {/* User vs Dataset Comparison - Only show if user has taken assessment */}
      {userData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Your Mental Health Profile Comparison</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compare your responses with dataset averages and healthy benchmarks
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Assessment taken: {new Date(userData.timestamp).toLocaleDateString()}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Chart 1: Mental Health Support Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Support Availability</CardTitle>
                <CardDescription>Workplace support benefits comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Benefits',
                        'You': userData.inputs.benefits === 'Yes' ? 100 : 0,
                        'Dataset Avg': 50.6,
                        'Ideal': 100,
                      },
                      {
                        name: 'Care Options',
                        'You': userData.inputs.care_options === 'Yes' ? 100 : 0,
                        'Dataset Avg': 48.2,
                        'Ideal': 100,
                      },
                      {
                        name: 'Easy Leave',
                        'You': ['Very easy', 'Somewhat easy'].includes(userData.inputs.leave) ? 100 : 0,
                        'Dataset Avg': 42.5,
                        'Ideal': 100,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Availability (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="You" fill="#8b5cf6" />
                    <Bar dataKey="Dataset Avg" fill="#94a3b8" />
                    <Bar dataKey="Ideal" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: Work-Life Balance Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Work-Life Balance Impact</CardTitle>
                <CardDescription>Mental health interference levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={[
                      {
                        category: 'Work Interference',
                        'You': {
                          'Never': 0,
                          'Rarely': 25,
                          'Sometimes': 50,
                          'Often': 100,
                        }[userData.inputs.work_interfere] || 0,
                        'Low Risk': 25,
                      },
                      {
                        category: 'Observed Consequences',
                        'You': userData.inputs.obs_consequence === 'Yes' ? 100 : 0,
                        'Low Risk': 0,
                      },
                      {
                        category: 'Leave Difficulty',
                        'You': {
                          'Very easy': 0,
                          'Somewhat easy': 25,
                          "Don't know": 50,
                          'Somewhat difficult': 75,
                          'Very difficult': 100,
                        }[userData.inputs.leave] || 50,
                        'Low Risk': 25,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} label={{ value: 'Impact Level (%)', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="category" dataKey="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="You" fill="#ef4444" />
                    <Bar dataKey="Low Risk" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 3: Risk Factors Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Risk Factors</CardTitle>
                <CardDescription>Key indicators affecting mental health support needs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Family History',
                          value: userData.inputs.family_history === 'Yes' ? 35 : 0,
                          color: '#ef4444',
                        },
                        {
                          name: 'Work Interference',
                          value: {
                            'Never': 0,
                            'Rarely': 15,
                            'Sometimes': 25,
                            'Often': 35,
                          }[userData.inputs.work_interfere] || 0,
                          color: '#f59e0b',
                        },
                        {
                          name: 'No Support',
                          value: userData.inputs.benefits === 'No' ? 20 : 0,
                          color: '#3b82f6',
                        },
                        {
                          name: 'Low Risk',
                          value: 100 - 
                            ((userData.inputs.family_history === 'Yes' ? 35 : 0) +
                            ({
                              'Never': 0,
                              'Rarely': 15,
                              'Sometimes': 25,
                              'Often': 35,
                            }[userData.inputs.work_interfere] || 0) +
                            (userData.inputs.benefits === 'No' ? 20 : 0)),
                          color: '#22c55e',
                        },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Family History', color: '#ef4444' },
                        { name: 'Work Interference', color: '#f59e0b' },
                        { name: 'No Support', color: '#3b82f6' },
                        { name: 'Low Risk', color: '#22c55e' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 4: Overall Support Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Workplace Support Score</CardTitle>
                <CardDescription>Combined score based on benefits, awareness, and accessibility</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Calculate support score
                  let score = 0;
                  if (userData.inputs.benefits === 'Yes') score += 33;
                  if (userData.inputs.care_options === 'Yes') score += 33;
                  if (['Very easy', 'Somewhat easy'].includes(userData.inputs.leave)) score += 34;
                  
                  const getScoreColor = (s) => {
                    if (s >= 75) return '#22c55e'; // Green
                    if (s >= 50) return '#f59e0b'; // Orange
                    return '#ef4444'; // Red
                  };

                  const getScoreLabel = (s) => {
                    if (s >= 75) return 'Excellent Support';
                    if (s >= 50) return 'Moderate Support';
                    if (s >= 25) return 'Limited Support';
                    return 'Poor Support';
                  };

                  return (
                    <div className="space-y-6">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Your Score</span>
                            <span className="text-sm font-medium" style={{ color: getScoreColor(score) }}>
                              {score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-8">
                            <div
                              className="h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                              style={{
                                width: `${score}%`,
                                backgroundColor: getScoreColor(score),
                              }}
                            >
                              {score > 20 && `${score}%`}
                            </div>
                          </div>
                          <p className="text-sm mt-2" style={{ color: getScoreColor(score) }}>
                            {getScoreLabel(score)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Mental Health Benefits</span>
                          <span className={userData.inputs.benefits === 'Yes' ? 'text-green-600' : 'text-red-600'}>
                            {userData.inputs.benefits}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Care Options Awareness</span>
                          <span className={userData.inputs.care_options === 'Yes' ? 'text-green-600' : 'text-red-600'}>
                            {userData.inputs.care_options}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Leave Accessibility</span>
                          <span className={['Very easy', 'Somewhat easy'].includes(userData.inputs.leave) ? 'text-green-600' : 'text-red-600'}>
                            {userData.inputs.leave}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium">Ideal Score (Healthy Workplace)</span>
                          <span className="text-green-600 font-bold">100/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6">
                          <div className="bg-green-500 h-6 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
