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
            {/* Chart 1: Workplace Support Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Workplace Support Comparison</CardTitle>
                <CardDescription>Your support vs dataset average vs ideal workplace</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={[
                      {
                        name: 'Benefits',
                        'You': userData.inputs.benefits === 'Yes' ? 100 : 0,
                        'Dataset': 50.6,
                        'Ideal': 100,
                      },
                      {
                        name: 'Care Options',
                        'You': userData.inputs.care_options === 'Yes' ? 100 : 0,
                        'Dataset': 48.2,
                        'Ideal': 100,
                      },
                      {
                        name: 'Easy Leave',
                        'You': ['Very easy', 'Somewhat easy'].includes(userData.inputs.leave) ? 100 : 0,
                        'Dataset': 42.5,
                        'Ideal': 100,
                      },
                      {
                        name: 'Work Interfere',
                        'You': {
                          'Never': 100,
                          'Rarely': 75,
                          'Sometimes': 50,
                          'Often': 0,
                        }[userData.inputs.work_interfere] || 50,
                        'Dataset': 60,
                        'Ideal': 100,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="You" fill="#8b5cf6" name="Your Score" />
                    <Bar dataKey="Dataset" fill="#94a3b8" name="Dataset Avg" />
                    <Bar dataKey="Ideal" fill="#22c55e" name="Ideal" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: Overall Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Support & Risk Score</CardTitle>
                <CardDescription>Combined assessment based on your responses</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Calculate support score
                  let supportScore = 0;
                  if (userData.inputs.benefits === 'Yes') supportScore += 25;
                  if (userData.inputs.care_options === 'Yes') supportScore += 25;
                  if (['Very easy', 'Somewhat easy'].includes(userData.inputs.leave)) supportScore += 25;
                  if (['Never', 'Rarely'].includes(userData.inputs.work_interfere)) supportScore += 25;
                  
                  // Calculate risk factors
                  let riskScore = 0;
                  if (userData.inputs.family_history === 'Yes') riskScore += 30;
                  if (['Sometimes', 'Often'].includes(userData.inputs.work_interfere)) riskScore += 35;
                  if (userData.inputs.obs_consequence === 'Yes') riskScore += 20;
                  if (userData.inputs.benefits === 'No') riskScore += 15;

                  const getScoreColor = (s) => {
                    if (s >= 75) return '#22c55e';
                    if (s >= 50) return '#f59e0b';
                    return '#ef4444';
                  };

                  const getRiskColor = (r) => {
                    if (r <= 25) return '#22c55e';
                    if (r <= 50) return '#f59e0b';
                    return '#ef4444';
                  };

                  return (
                    <div className="space-y-8">
                      {/* Support Score */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Support Score</span>
                          <span className="text-sm font-bold" style={{ color: getScoreColor(supportScore) }}>
                            {supportScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-8">
                          <div
                            className="h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              width: `${supportScore}%`,
                              backgroundColor: getScoreColor(supportScore),
                            }}
                          >
                            {supportScore > 15 && `${supportScore}%`}
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Low</span>
                          <span>Moderate</span>
                          <span>Excellent</span>
                        </div>
                      </div>

                      {/* Risk Score */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Risk Factors</span>
                          <span className="text-sm font-bold" style={{ color: getRiskColor(riskScore) }}>
                            {riskScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-8">
                          <div
                            className="h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              width: `${riskScore}%`,
                              backgroundColor: getRiskColor(riskScore),
                            }}
                          >
                            {riskScore > 15 && `${riskScore}%`}
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Low Risk</span>
                          <span>Moderate</span>
                          <span>High Risk</span>
                        </div>
                      </div>

                      {/* Comparison with Ideal */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Your Support Score</span>
                          <span className="font-bold" style={{ color: getScoreColor(supportScore) }}>
                            {supportScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Dataset Average</span>
                          <span className="font-bold text-gray-600">55%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Ideal Workplace</span>
                          <span className="font-bold text-green-600">100%</span>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Key Factors:</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${userData.inputs.family_history === 'Yes' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span>Family History: {userData.inputs.family_history}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${['Sometimes', 'Often'].includes(userData.inputs.work_interfere) ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span>Work Impact: {userData.inputs.work_interfere}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${userData.inputs.benefits === 'Yes' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>Benefits: {userData.inputs.benefits}</span>
                          </div>
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

          {/* Dataset Visualization Charts */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Dataset Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chart 1: Treatment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Seeking Distribution</CardTitle>
                  <CardDescription>Percentage of people seeking vs not seeking treatment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Seeking Treatment',
                            value: dataset_info.treatment_yes,
                            color: '#22c55e',
                          },
                          {
                            name: 'Not Seeking Treatment',
                            value: dataset_info.treatment_no,
                            color: '#ef4444',
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p><strong>{dataset_info.treatment_yes}</strong> out of <strong>{dataset_info.total_samples}</strong> people seek treatment</p>
                  </div>
                </CardContent>
              </Card>

              {/* Chart 2: Industry Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Distribution</CardTitle>
                  <CardDescription>Tech vs Non-Tech workers in the survey</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          category: 'Tech Companies',
                          count: Math.round(dataset_info.total_samples * dataset_info.tech_companies_pct),
                          percentage: (dataset_info.tech_companies_pct * 100).toFixed(1),
                        },
                        {
                          category: 'Non-Tech Companies',
                          count: Math.round(dataset_info.total_samples * (1 - dataset_info.tech_companies_pct)),
                          percentage: ((1 - dataset_info.tech_companies_pct) * 100).toFixed(1),
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'count') return [`${value} people`, 'Count'];
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#8b5cf6" name="Number of People" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p><strong>{(dataset_info.tech_companies_pct * 100).toFixed(1)}%</strong> from tech industry</p>
                  </div>
                </CardContent>
              </Card>

              {/* Chart 3: Treatment Rate by Key Demographics */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Mental Health Awareness Metrics</CardTitle>
                  <CardDescription>Key statistics from the dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          metric: 'Treatment Seekers',
                          percentage: (dataset_info.treatment_rate * 100).toFixed(1),
                          value: dataset_info.treatment_rate * 100,
                        },
                        {
                          metric: 'Tech Industry',
                          percentage: (dataset_info.tech_companies_pct * 100).toFixed(1),
                          value: dataset_info.tech_companies_pct * 100,
                        },
                        {
                          metric: 'Global Diversity',
                          percentage: ((dataset_info.countries / 195) * 100).toFixed(1),
                          value: (dataset_info.countries / 195) * 100,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Bar dataKey="value" fill="#3b82f6">
                        <Cell fill="#22c55e" />
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#f59e0b" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{(dataset_info.treatment_rate * 100).toFixed(1)}%</div>
                      <div className="text-muted-foreground">Seek Treatment</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{(dataset_info.tech_companies_pct * 100).toFixed(1)}%</div>
                      <div className="text-muted-foreground">Tech Workers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{dataset_info.countries} Countries</div>
                      <div className="text-muted-foreground">Represented</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
