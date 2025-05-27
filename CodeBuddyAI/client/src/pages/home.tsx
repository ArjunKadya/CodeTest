import { useState } from "react";
import { Code, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserStoryInput from "@/components/UserStoryInput";
import CodeGenerationOutput from "@/components/CodeGenerationOutput";
import TestGenerationPanel from "@/components/TestGenerationPanel";
import ProcessingStatus from "@/components/ProcessingStatus";
import OllamaStatus from "@/components/OllamaStatus";

export default function Home() {
  const [currentUserStoryId, setCurrentUserStoryId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">CodeBuddy</h1>
              </div>
              <span className="text-sm text-slate-500 hidden sm:inline">AI-Powered Code Generation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Story Input */}
          <div className="lg:col-span-1">
            <UserStoryInput onUserStoryCreated={setCurrentUserStoryId} />
            <div className="mt-6">
              <OllamaStatus />
            </div>
          </div>

          {/* Code Generation Output */}
          <div className="lg:col-span-2">
            <CodeGenerationOutput userStoryId={currentUserStoryId} />
          </div>
        </div>

        {/* Test Generation Panel */}
        <div className="mt-6">
          <TestGenerationPanel userStoryId={currentUserStoryId} />
        </div>

        {/* Processing Status */}
        <div className="mt-6">
          <ProcessingStatus userStoryId={currentUserStoryId} />
        </div>
      </div>
    </div>
  );
}
