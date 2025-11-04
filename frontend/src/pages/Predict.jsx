import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

const FORM_FIELDS = [
  { name: 'Age', type: 'number', min: 18, max: 80, required: true },
  {
    name: 'Gender',
    type: 'select',
    options: ['Male', 'Female', 'Other', 'Non-binary', 'Transgender'],
    required: true,
  },
  { name: 'Country', type: 'text', required: true },
  {
    name: 'self_employed',
    label: 'Self Employed',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'family_history',
    label: 'Family History of Mental Health',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'work_interfere',
    label: 'Work Interference',
    type: 'select',
    options: ['Never', 'Rarely', 'Sometimes', 'Often'],
    required: true,
  },
  {
    name: 'no_employees',
    label: 'Number of Employees',
    type: 'select',
    options: ['1-5', '6-25', '26-100', '100-500', '500-1000', 'More than 1000'],
    required: true,
  },
  {
    name: 'remote_work',
    label: 'Remote Work',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'tech_company',
    label: 'Tech Company',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'benefits',
    label: 'Mental Health Benefits',
    type: 'select',
    options: ['Yes', 'No', "Don't know"],
    required: true,
  },
  {
    name: 'care_options',
    label: 'Care Options',
    type: 'select',
    options: ['Yes', 'No', "Don't know"],
    required: true,
  },
  {
    name: 'wellness_program',
    label: 'Wellness Program',
    type: 'select',
    options: ['Yes', 'No', "Don't know"],
    required: true,
  },
  {
    name: 'seek_help',
    label: 'Seek Help Resources',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'anonymity',
    label: 'Anonymity',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'leave',
    label: 'Ease of Taking Leave',
    type: 'select',
    options: ['Very easy', 'Somewhat easy', "Don't know", 'Somewhat difficult', 'Very difficult'],
    required: true,
  },
  {
    name: 'mental_health_consequence',
    label: 'Mental Health Consequence',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'phys_health_consequence',
    label: 'Physical Health Consequence',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'coworkers',
    label: 'Discuss with Coworkers',
    type: 'select',
    options: ['Yes', 'Some of them', 'No'],
    required: true,
  },
  {
    name: 'supervisor',
    label: 'Discuss with Supervisor',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'mental_health_interview',
    label: 'Mental Health in Interview',
    type: 'select',
    options: ['Yes', 'No', 'Maybe'],
    required: true,
  },
  {
    name: 'phys_health_interview',
    label: 'Physical Health in Interview',
    type: 'select',
    options: ['Yes', 'No', 'Maybe'],
    required: true,
  },
  {
    name: 'mental_vs_physical',
    label: 'Mental vs Physical Health',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'obs_consequence',
    label: 'Observed Consequences',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
  },
];

export const Predict = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = FORM_FIELDS.every((field) => formData[field.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.predict(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Mental Health Treatment Predictor</h1>
        <p className="text-muted-foreground">
          Fill in the form below to predict the likelihood of seeking mental health treatment.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide accurate information for better predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {FORM_FIELDS.map((field) => (
                    <div key={field.name} className={field.type === 'number' ? '' : ''}>
                      <Label htmlFor={field.name} className="capitalize mb-2 block">
                        {field.label || field.name.replace(/_/g, ' ')}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>

                      {field.type === 'select' ? (
                        <Select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          className="w-full"
                        >
                          <option value="">Select an option</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          name={field.name}
                          min={field.min}
                          max={field.max}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Prediction Error</p>
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Predicting...
                      </>
                    ) : (
                      'Get Prediction'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Result Section */}
        <div>
          {result && (
            <Card className="sticky top-20 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Prediction Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Prediction */}
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    result.prediction === 'Yes'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}>
                    {result.prediction}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Likely to seek mental health treatment
                  </p>
                </div>

                {/* Probability Gauge */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>No Treatment</span>
                    <span className="font-semibold">{(result.probability.No * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${result.probability.No * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm mt-4">
                    <span>Yes Treatment</span>
                    <span className="font-semibold">{(result.probability.Yes * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${result.probability.Yes * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Confidence Level</p>
                  <div className={`text-lg font-bold ${
                    result.confidence === 'High'
                      ? 'text-green-600 dark:text-green-400'
                      : result.confidence === 'Medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {result.confidence}
                  </div>
                </div>

                {/* Top Factors */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Top Contributing Factors</h4>
                  <div className="space-y-2">
                    {result.top_factors?.slice(0, 5).map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate">
                          {factor.feature.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          factor.direction === 'positive'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                        }`}>
                          {factor.direction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
