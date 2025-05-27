import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserStorySchema, insertGenerationJobSchema } from "@shared/schema";
import { z } from "zod";

// Simulated NLP processing function
async function processUserStoryWithNLP(story: string) {
  // Simulate NLP processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    entities: ["user", "registration", "account", "email", "password"],
    intent: "user_registration",
    requirements: [
      "Email validation",
      "Password security requirements",
      "Success message display",
      "Dashboard redirect"
    ],
    acceptanceCriteria: [
      "User can enter email and password",
      "Email validation is performed",
      "Password must meet security requirements",
      "Success message is shown after registration",
      "User is redirected to dashboard"
    ]
  };
}

// Simulated Ollama code generation
async function generateCodeWithOllama(story: string, language: string, projectType: string, nlpAnalysis: any) {
  // Simulate Ollama processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return `// Generated ${language} code for ${projectType}
// User Story: ${story.substring(0, 100)}...

import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../utils/validation';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation logic
    const newErrors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    try {
      const response = await registerUser(formData);
      // Handle success - redirect to dashboard
      showSuccessMessage('Registration successful!');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
        />
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default UserRegistration;`;
}

// Simulated test generation functions
async function generateUnitTests(code: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserRegistration from './UserRegistration';

describe('UserRegistration Component', () => {
  test('renders registration form', () => {
    render(<UserRegistration />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  test('shows validation error for invalid email', async () => {
    render(<UserRegistration />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    render(<UserRegistration />);
    
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });
});`;
}

async function generateIntegrationTests(code: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `import request from 'supertest';
import app from '../app';
import db from '../config/database';

describe('User Registration Integration', () => {
  beforeEach(async () => {
    await db.clean();
  });

  test('POST /api/register creates new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('message', 'Registration successful');
    
    // Verify user exists in database
    const user = await db.findUserByEmail('test@example.com');
    expect(user).toBeTruthy();
  });

  test('POST /api/register sends activation email', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'securepass123'
    };

    await request(app)
      .post('/api/register')
      .send(userData)
      .expect(201);

    // Verify activation email was queued
    const emailJobs = await emailQueue.getJobs();
    expect(emailJobs.length).toBe(1);
    expect(emailJobs[0].data.to).toBe('newuser@example.com');
  });
});`;
}

async function generateE2ETests(code: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('complete registration process', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'e2etest@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.fill('[data-testid="confirm-password-input"]', 'testpassword123');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toHaveText('Registration successful!');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('handles duplicate email registration', async ({ page }) => {
    await page.goto('/register');
    
    // Try to register with existing email
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="register-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toHaveText('Email already exists');
  });
});`;
}

async function generatePenetrationTests(code: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `import request from 'supertest';
import app from '../app';

describe('Security Penetration Tests', () => {
  test('prevents SQL injection in email field', async () => {
    const maliciousData = {
      email: "test@example.com'; DROP TABLE users; --",
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/register')
      .send(maliciousData);

    // Should not crash the application
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  test('prevents XSS attacks in user input', async () => {
    const xssData = {
      email: 'test@example.com',
      password: '<script>alert("xss")</script>'
    };

    const response = await request(app)
      .post('/api/register')
      .send(xssData);

    // Should sanitize or reject malicious input
    expect(response.status).toBe(400);
  });

  test('enforces rate limiting on registration endpoint', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Make multiple rapid requests
    const promises = Array(20).fill().map(() => 
      request(app).post('/api/register').send(userData)
    );

    const responses = await Promise.all(promises);
    
    // Should have rate limiting responses
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});`;
}

async function generateRegressionTests(code: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `import { test, expect } from '@playwright/test';

test.describe('Registration Regression Tests', () => {
  test('maintains backward compatibility with legacy email formats', async ({ page }) => {
    await page.goto('/register');
    
    // Test various email formats that should still work
    const emailFormats = [
      'user@domain.com',
      'user.name@domain.com',
      'user+tag@domain.co.uk',
      'user_name@sub.domain.org'
    ];

    for (const email of emailFormats) {
      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', 'validpassword123');
      
      const submitButton = page.locator('[data-testid="register-button"]');
      await expect(submitButton).toBeEnabled();
      
      // Clear for next iteration
      await page.fill('[data-testid="email-input"]', '');
    }
  });

  test('preserves password requirements after UI changes', async ({ page }) => {
    await page.goto('/register');
    
    // Test password requirements haven't changed
    const weakPasswords = ['123', 'abc', 'password', '12345678'];
    
    for (const password of weakPasswords) {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', password);
      await page.click('[data-testid="register-button"]');
      
      // Should show appropriate validation message
      const errorMessage = page.locator('[data-testid="password-error"]');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('maintains form state during validation errors', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="email-input"]', 'valid@example.com');
    await page.fill('[data-testid="password-input"]', '123'); // Invalid
    await page.click('[data-testid="register-button"]');
    
    // Email should still be filled after validation error
    const emailValue = await page.inputValue('[data-testid="email-input"]');
    expect(emailValue).toBe('valid@example.com');
  });
});`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create user story
  app.post("/api/user-stories", async (req, res) => {
    try {
      const validatedData = insertUserStorySchema.parse(req.body);
      const userStory = await storage.createUserStory(validatedData);
      
      // Process with NLP
      const nlpAnalysis = await processUserStoryWithNLP(validatedData.story);
      await storage.updateUserStory(userStory.id, { nlpAnalysis });
      
      res.json(userStory);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });

  // Get user story
  app.get("/api/user-stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userStory = await storage.getUserStory(id);
      
      if (!userStory) {
        return res.status(404).json({ message: "User story not found" });
      }
      
      res.json(userStory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all user stories
  app.get("/api/user-stories", async (req, res) => {
    try {
      const userStories = await storage.getAllUserStories();
      res.json(userStories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate code
  app.post("/api/generate-code/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userStory = await storage.getUserStory(id);
      
      if (!userStory) {
        return res.status(404).json({ message: "User story not found" });
      }

      // Create generation job
      const job = await storage.createGenerationJob({
        userStoryId: id,
        jobType: "code"
      });

      // Update job status to processing
      await storage.updateGenerationJob(job.id, { status: "processing" });

      // Generate code with Ollama
      try {
        const generatedCode = await generateCodeWithOllama(
          userStory.story,
          userStory.language,
          userStory.projectType,
          userStory.nlpAnalysis
        );

        // Update user story with generated code
        await storage.updateUserStory(id, { generatedCode });
        
        // Update job as completed
        await storage.updateGenerationJob(job.id, {
          status: "completed",
          result: generatedCode,
          completedAt: new Date()
        });

        res.json({ success: true, code: generatedCode });
      } catch (error) {
        await storage.updateGenerationJob(job.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Code generation failed",
          completedAt: new Date()
        });
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Generation failed" });
    }
  });

  // Generate tests
  app.post("/api/generate-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { testType } = req.body;
      
      if (!testType || !['unit', 'integration', 'e2e', 'penetration', 'regression'].includes(testType)) {
        return res.status(400).json({ message: "Invalid test type" });
      }

      const userStory = await storage.getUserStory(id);
      
      if (!userStory) {
        return res.status(404).json({ message: "User story not found" });
      }

      if (!userStory.generatedCode) {
        return res.status(400).json({ message: "Code must be generated first" });
      }

      // Create generation job
      const job = await storage.createGenerationJob({
        userStoryId: id,
        jobType: `${testType}_tests`
      });

      // Update job status to processing
      await storage.updateGenerationJob(job.id, { status: "processing" });

      try {
        let generatedTests: string;
        
        switch (testType) {
          case 'unit':
            generatedTests = await generateUnitTests(userStory.generatedCode);
            await storage.updateUserStory(id, { unitTests: generatedTests });
            break;
          case 'integration':
            generatedTests = await generateIntegrationTests(userStory.generatedCode);
            await storage.updateUserStory(id, { integrationTests: generatedTests });
            break;
          case 'e2e':
            generatedTests = await generateE2ETests(userStory.generatedCode);
            await storage.updateUserStory(id, { e2eTests: generatedTests });
            break;
          case 'penetration':
            generatedTests = await generatePenetrationTests(userStory.generatedCode);
            await storage.updateUserStory(id, { penetrationTests: generatedTests });
            break;
          case 'regression':
            generatedTests = await generateRegressionTests(userStory.generatedCode);
            await storage.updateUserStory(id, { regressionTests: generatedTests });
            break;
          default:
            throw new Error("Invalid test type");
        }

        // Update job as completed
        await storage.updateGenerationJob(job.id, {
          status: "completed",
          result: generatedTests,
          completedAt: new Date()
        });

        res.json({ success: true, tests: generatedTests, testType });
      } catch (error) {
        await storage.updateGenerationJob(job.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Test generation failed",
          completedAt: new Date()
        });
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Test generation failed" });
    }
  });

  // Get generation jobs for a user story
  app.get("/api/user-stories/:id/jobs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobs = await storage.getJobsByUserStoryId(id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Ollama status (simulated)
  app.get("/api/ollama/status", async (req, res) => {
    res.json({
      codeGenerationModel: { status: "online", model: "CodeLlama-7B" },
      testGenerationModel: { status: "online", model: "CodeLlama-7B" },
      nlpPipeline: { status: "ready", model: "BERT-Base" }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
