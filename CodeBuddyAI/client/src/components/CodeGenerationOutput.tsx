import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Copy, Code, FlaskRound, Link, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { copyToClipboard } from "@/lib/utils";
import type { UserStory } from "@shared/schema";

interface CodeGenerationOutputProps {
  userStoryId: number | null;
}

export default function CodeGenerationOutput({ userStoryId }: CodeGenerationOutputProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("code");

  const { data: userStory, isLoading } = useQuery({
    queryKey: [`/api/user-stories/${userStoryId}`],
    enabled: !!userStoryId,
    refetchInterval: 2000, // Refresh every 2 seconds to get updated content
  }) as { data: UserStory | undefined, isLoading: boolean };

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/generate-code/${userStoryId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code generated successfully!",
        description: "Your code has been generated and is ready for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stories", userStoryId] });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = async (content: string | null) => {
    if (!content) {
      toast({
        title: "Nothing to copy",
        description: "No content available to copy.",
        variant: "destructive",
      });
      return;
    }

    try {
      await copyToClipboard(content);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!userStory) return;

    const data = {
      userStory: userStory.story,
      generatedCode: userStory.generatedCode,
      unitTests: userStory.unitTests,
      integrationTests: userStory.integrationTests,
      e2eTests: userStory.e2eTests,
      penetrationTests: userStory.penetrationTests,
      regressionTests: userStory.regressionTests,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codebuddy-export-${userStory.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Code and tests have been exported.",
    });
  };

  if (!userStoryId) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
        <CardContent className="p-8 text-center">
          <div className="text-slate-400 mb-4">
            <Code className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No User Story Selected</h3>
          <p className="text-slate-600">Create a user story to start generating code and tests.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Generated Code & Tests</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleCopyCode(getActiveTabContent())}>
              <Copy className="w-4 h-4 mr-1" />
              Copy All
            </Button>
          </div>
        </div>

        {!userStory?.generatedCode && (
          <div className="flex items-center justify-between mt-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">Ready to generate code</p>
              <p className="text-xs text-blue-700">Click the button to start code generation with AI</p>
            </div>
            <Button
              onClick={() => generateCodeMutation.mutate()}
              disabled={generateCodeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generateCodeMutation.isPending ? "Generating..." : "Generate Code"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-6 bg-slate-100 text-xs">
              <TabsTrigger value="code" className="flex items-center space-x-1">
                <Code className="w-3 h-3" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="unit-tests" className="flex items-center space-x-1">
                <FlaskRound className="w-3 h-3" />
                <span>Unit</span>
              </TabsTrigger>
              <TabsTrigger value="integration-tests" className="flex items-center space-x-1">
                <Link className="w-3 h-3" />
                <span>Integration</span>
              </TabsTrigger>
              <TabsTrigger value="e2e-tests" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>E2E</span>
              </TabsTrigger>
              <TabsTrigger value="penetration-tests" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="regression-tests" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Regression</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 h-96 overflow-hidden">
            <TabsContent value="code" className="h-full mt-0">
              <CodeTab
                content={userStory?.generatedCode || null}
                filename={getFilename(userStory?.language)}
                badge="Generated"
                badgeColor="green"
                onCopy={() => handleCopyCode(userStory?.generatedCode || null)}
              />
            </TabsContent>

            <TabsContent value="unit-tests" className="h-full mt-0">
              <CodeTab
                content={userStory?.unitTests || null}
                filename={getTestFilename(userStory?.language, "unit")}
                badge="Unit Tests"
                badgeColor="blue"
                onCopy={() => handleCopyCode(userStory?.unitTests || null)}
              />
            </TabsContent>

            <TabsContent value="integration-tests" className="h-full mt-0">
              <CodeTab
                content={userStory?.integrationTests || null}
                filename={getTestFilename(userStory?.language, "integration")}
                badge="Integration"
                badgeColor="yellow"
                onCopy={() => handleCopyCode(userStory?.integrationTests || null)}
              />
            </TabsContent>

            <TabsContent value="e2e-tests" className="h-full mt-0">
              <CodeTab
                content={userStory?.e2eTests || null}
                filename={getTestFilename(userStory?.language, "e2e")}
                badge="E2E Tests"
                badgeColor="purple"
                onCopy={() => handleCopyCode(userStory?.e2eTests || null)}
              />
            </TabsContent>

            <TabsContent value="penetration-tests" className="h-full mt-0">
              <CodeTab
                content={userStory?.penetrationTests || null}
                filename={getTestFilename(userStory?.language, "penetration")}
                badge="Security Tests"
                badgeColor="yellow"
                onCopy={() => handleCopyCode(userStory?.penetrationTests || null)}
              />
            </TabsContent>

            <TabsContent value="regression-tests" className="h-full mt-0">
              <CodeTab
                content={userStory?.regressionTests || null}
                filename={getTestFilename(userStory?.language, "regression")}
                badge="Regression Tests"
                badgeColor="blue"
                onCopy={() => handleCopyCode(userStory?.regressionTests || null)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );

  function getActiveTabContent(): string | null {
    switch (activeTab) {
      case "code":
        return userStory?.generatedCode || null;
      case "unit-tests":
        return userStory?.unitTests || null;
      case "integration-tests":
        return userStory?.integrationTests || null;
      case "e2e-tests":
        return userStory?.e2eTests || null;
      case "penetration-tests":
        return userStory?.penetrationTests || null;
      case "regression-tests":
        return userStory?.regressionTests || null;
      default:
        return null;
    }
  }
}

interface CodeTabProps {
  content: string | null;
  filename: string;
  badge: string;
  badgeColor: "green" | "blue" | "yellow" | "purple";
  onCopy: () => void;
}

function CodeTab({ content, filename, badge, badgeColor, onCopy }: CodeTabProps) {
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Code className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No content generated yet</p>
          <p className="text-xs">Generate code first to see tests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700">{filename}</span>
          <Badge variant={badgeColor === "green" ? "default" : "secondary"} className={getBadgeClasses(badgeColor)}>
            {badge}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <div className="code-block h-full overflow-auto">
        <pre className="text-sm leading-relaxed">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

function getFilename(language: string | undefined): string {
  switch (language) {
    case "javascript":
      return "UserRegistration.js";
    case "typescript":
      return "UserRegistration.tsx";
    case "python":
      return "user_registration.py";
    case "java":
      return "UserRegistration.java";
    case "csharp":
      return "UserRegistration.cs";
    case "go":
      return "user_registration.go";
    case "rust":
      return "user_registration.rs";
    default:
      return "UserRegistration.js";
  }
}

function getTestFilename(language: string | undefined, testType: string): string {
  switch (language) {
    case "javascript":
      return `UserRegistration.${testType}.test.js`;
    case "typescript":
      return `UserRegistration.${testType}.test.tsx`;
    case "python":
      return `test_user_registration_${testType}.py`;
    case "java":
      return `UserRegistration${testType.charAt(0).toUpperCase() + testType.slice(1)}Test.java`;
    default:
      return `UserRegistration.${testType}.test.js`;
  }
}

function getBadgeClasses(color: string): string {
  switch (color) {
    case "green":
      return "bg-green-100 text-green-800";
    case "blue":
      return "bg-blue-100 text-blue-800";
    case "yellow":
      return "bg-yellow-100 text-yellow-800";
    case "purple":
      return "bg-purple-100 text-purple-800";
    default:
      return "";
  }
}
