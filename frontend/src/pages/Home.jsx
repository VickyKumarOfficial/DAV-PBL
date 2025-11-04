import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, Zap, TrendingUp, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Home = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.health();
        setIsHealthy(true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MindCare Predictor
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 dark:from-blue-50 dark:via-purple-50 dark:to-pink-50 bg-clip-text text-transparent">
            Predict Mental Health Treatment Needs
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Harness the power of machine learning to predict the likelihood of mental health treatment based on workplace and demographic factors. Get actionable insights to support employee wellbeing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/predict">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Prediction <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/insights">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                View Analytics
              </Button>
            </Link>
          </div>

          {/* API Status */}
          <div className="mt-6 flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-muted-foreground">
              {loading ? 'Connecting...' : isHealthy ? 'API Connected' : 'API Disconnected'}
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Why Use MindCare?</h2>
        <p className="text-muted-foreground mb-8">
          Our advanced ML model provides accurate predictions and deep insights into mental health treatment patterns.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 w-fit bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <CardTitle>Fast & Accurate</CardTitle>
              <CardDescription>
                AI-powered predictions with 79% ROC-AUC accuracy
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 w-fit bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <CardTitle>Data-Driven Insights</CardTitle>
              <CardDescription>
                Analyze 1,259 mental health survey responses
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 w-fit bg-pink-100 dark:bg-pink-900 rounded-lg mb-4">
                <Users className="w-6 h-6 text-pink-600 dark:text-pink-300" />
              </div>
              <CardTitle>Explainable AI</CardTitle>
              <CardDescription>
                Understand which factors influence predictions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>
            Our XGBoost classifier trained on extensive workplace mental health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600">79.45%</div>
              <p className="text-sm text-muted-foreground">ROC-AUC Score</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">69.39%</div>
              <p className="text-sm text-muted-foreground">F1 Score</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">81.19%</div>
              <p className="text-sm text-muted-foreground">Cross-Val AUC</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">50</div>
              <p className="text-sm text-muted-foreground">Features Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 md:p-12 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to Make a Prediction?</h3>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Fill in your details and let our AI model predict your mental health treatment likelihood based on workplace factors.
        </p>
        <Link to="/predict">
          <Button size="lg" variant="secondary" className="gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
