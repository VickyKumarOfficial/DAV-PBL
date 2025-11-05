import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

// Essential fields based on ML feature importance (top 10 features)
const FORM_FIELDS = [
  { 
    name: 'Age', 
    type: 'number', 
    min: 18, 
    max: 80, 
    required: true,
    description: 'Your current age'
  },
  {
    name: 'Gender',
    type: 'select',
    options: ['Male', 'Female', 'Other'],
    required: true,
    description: 'Gender identity'
  },
  { 
    name: 'Country', 
    type: 'text', 
    required: true,
    description: 'Country where you work'
  },
  {
    name: 'family_history',
    label: 'Family History',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    description: 'Do you have a family history of mental illness?'
  },
  {
    name: 'work_interfere',
    label: 'Work Interference',
    type: 'select',
    options: ['Never', 'Rarely', 'Sometimes', 'Often'],
    required: true,
    description: 'How often does mental health affect your work performance?'
  },
  {
    name: 'benefits',
    label: 'Mental Health Benefits',
    type: 'select',
    options: ['Yes', 'No', "Don't know"],
    required: true,
    description: 'Does your employer provide mental health benefits?'
  },
  {
    name: 'care_options',
    label: 'Care Options',
    type: 'select',
    options: ['Yes', 'No', "Don't know"],
    required: true,
    description: 'Are you aware of care options for mental health at work?'
  },
  {
    name: 'self_employed',
    label: 'Self Employed',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    description: 'Are you self-employed?'
  },
  {
    name: 'obs_consequence',
    label: 'Observed Consequences',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    description: 'Have you observed negative consequences for discussing mental health at work?'
  },
  {
    name: 'leave',
    label: 'Mental Health Leave',
    type: 'select',
    options: ['Very easy', 'Somewhat easy', "Don't know", 'Somewhat difficult', 'Very difficult'],
    required: true,
    description: 'How easy is it to take medical leave for mental health?'
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
    setResult(null);

    try {
      console.log('Submitting form data:', formData);
      const response = await api.predict(formData);
      console.log('Received response:', response);
      setResult(response);
      
      // Save user data and prediction result to localStorage for comparison graphs
      localStorage.setItem('userAssessmentData', JSON.stringify({
        inputs: formData,
        prediction: response,
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to make prediction. Please try again.');
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
        <h1 className="text-4xl font-bold mb-2">Mental Health Support Assessment</h1>
        <p className="text-muted-foreground">
          Answer 10 questions to understand your mental health support needs. Takes less than 2 minutes.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Assessment Form</CardTitle>
              <CardDescription>
                All responses are confidential. Answer honestly for the most accurate insights.
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
            <div className="space-y-4">
              {/* Main Result Card */}
              <Card className="sticky top-20 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Assessment Result
                  </CardTitle>
                  <CardDescription>
                    Based on your responses, here's your mental health support assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Level */}
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Support Likelihood</p>
                    <div className={`text-3xl font-bold mb-1 ${
                      result.probability.Yes >= 0.7
                        ? 'text-red-600 dark:text-red-400'
                        : result.probability.Yes >= 0.5
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {result.probability.Yes >= 0.7 ? 'High' : result.probability.Yes >= 0.5 ? 'Medium' : 'Low'}
                    </div>
                    <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {(result.probability.Yes * 100).toFixed(0)}% likelihood
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      of benefiting from mental health support
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          result.probability.Yes >= 0.7
                            ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                            : result.probability.Yes >= 0.5
                            ? 'bg-gradient-to-r from-green-500 to-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${result.probability.Yes * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Top Risk Factors */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Key Factors Identified
                    </h4>
                    <div className="space-y-2">
                      {result.top_factors?.slice(0, 3).map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                          <span className="text-muted-foreground">
                            {factor.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="text-center text-xs text-muted-foreground">
                    Model Confidence: <span className="font-semibold">{result.confidence}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Card */}
              <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-teal-50 dark:to-teal-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Personalized Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <p className="font-medium text-sm">Talk to Your Employer</p>
                        <p className="text-xs text-muted-foreground">Ask HR about Employee Assistance Programs (EAP) and mental health benefits available to you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <p className="font-medium text-sm">Consult a Professional</p>
                        <p className="text-xs text-muted-foreground">Consider speaking with a therapist or counselor who can provide personalized guidance.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <p className="font-medium text-sm">Build a Support Network</p>
                        <p className="text-xs text-muted-foreground">Connect with support groups, trusted colleagues, or friends who understand mental health challenges.</p>
                      </div>
                    </div>
                    {result.probability.Yes >= 0.7 && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">!</div>
                        <div>
                          <p className="font-medium text-sm text-red-600 dark:text-red-400">Consider Immediate Support</p>
                          <p className="text-xs text-muted-foreground">If you're experiencing crisis, reach out to emergency resources listed below.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resources Card */}
              <Card className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg">📞 Mental Health Resources</CardTitle>
                  <CardDescription className="text-xs">
                    Professional help is available 24/7
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <p className="font-semibold text-sm mb-1">🆘 Crisis Support</p>
                      <p className="text-xs text-muted-foreground">National Suicide Prevention Lifeline</p>
                      <a href="tel:988" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">988</a>
                      <p className="text-xs text-muted-foreground mt-1">Available 24/7 for anyone in crisis</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <p className="font-semibold text-sm mb-1">💬 Crisis Text Line</p>
                      <p className="text-xs text-muted-foreground">Text HOME to</p>
                      <a href="sms:741741" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">741741</a>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <p className="font-semibold text-sm mb-1">🌐 Online Therapy</p>
                      <div className="space-y-1">
                        <a href="https://www.betterhelp.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 dark:text-blue-400 hover:underline">BetterHelp →</a>
                        <a href="https://www.talkspace.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 dark:text-blue-400 hover:underline">Talkspace →</a>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <p className="font-semibold text-sm mb-1">📚 Resources</p>
                      <div className="space-y-1">
                        <a href="https://www.nami.org" target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 dark:text-blue-400 hover:underline">NAMI (Support & Education) →</a>
                        <a href="https://www.mentalhealth.gov" target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 dark:text-blue-400 hover:underline">MentalHealth.gov →</a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mt-4">
                    <p className="text-xs text-yellow-900 dark:text-yellow-100">
                      <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a medical diagnosis. Please consult with a qualified mental health professional for proper evaluation and treatment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
