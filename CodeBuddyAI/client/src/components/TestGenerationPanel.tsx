import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, FlaskRound, Link, Globe, Shield, RotateCcw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TestGenerationPanelProps {
  userStoryId: number | null;
}

const testTypes = [
  {
    id: "unit",
    name: "Unit Tests",
    description: "Component-level testing",
    color: "green",
    icon: FlaskRound,
  },
  {
    id: "integration",
    name: "Integration",
    description: "API & database testing",
    color: "blue",
    icon: Link,
  },
  {
    id: "e2e",
    name: "E2E Tests",
    description: "Full user workflows",
    color: "purple",
    icon: Globe,
  },
  {
    id: "penetration",
    name: "Penetration",
    description: "Security vulnerability testing",
    color: "red",
    icon: Shield,
  },
  {
    id: "regression",
    name: "Regression",
    description: "Change impact testing",
    color: "orange",
    icon: RotateCcw,
  },
];

export default function TestGenerationPanel({ userStoryId }: TestGenerationPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTestsMutation = useMutation({
    mutationFn: async (testType: string) => {
      const response = await apiRequest("POST", `/api/generate-tests/${userStoryId}`, {
        testType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tests generated successfully!",
        description: `${data.testType} tests have been generated and are ready for review.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stories", userStoryId] });
    },
    onError: (error) => {
      toast({
        title: "Test generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateTests = (testType: string) => {
    if (!userStoryId) {
      toast({
        title: "No user story selected",
        description: "Please create a user story first.",
        variant: "destructive",
      });
      return;
    }

    generateTestsMutation.mutate(testType);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Advanced Test Generation</CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure Tests
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {testTypes.map((testType) => {
            const Icon = testType.icon;
            return (
              <TestTypeCard
                key={testType.id}
                testType={testType}
                Icon={Icon}
                onGenerate={() => handleGenerateTests(testType.id)}
                isLoading={generateTestsMutation.isPending}
                disabled={!userStoryId}
              />
            );
          })}
        </div>

        {/* Generation Status */}
        <div className="mt-6 bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Ollama Test Generation Pipeline</p>
                <p className="text-xs text-slate-500">Ready to generate comprehensive test suites</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Model:</span>
              <span className="text-xs font-medium text-slate-700">CodeLlama-7B</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TestTypeCardProps {
  testType: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
  Icon: React.ComponentType<{ className?: string }>;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

function TestTypeCard({ testType, Icon, onGenerate, isLoading, disabled }: TestTypeCardProps) {
  const colorClasses = getColorClasses(testType.color);

  return (
    <div className={`${colorClasses.background} border ${colorClasses.border} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-medium ${colorClasses.text}`}>{testType.name}</h4>
        <div className={`w-3 h-3 ${colorClasses.dot} rounded-full`}></div>
      </div>
      <p className={`text-sm ${colorClasses.description} mb-3`}>{testType.description}</p>
      <Button
        className={`w-full ${colorClasses.button} text-white text-sm hover:opacity-90 transition-colors`}
        onClick={onGenerate}
        disabled={isLoading || disabled}
      >
        {isLoading ? "Generating..." : "Generate"}
      </Button>
    </div>
  );
}

function getColorClasses(color: string) {
  switch (color) {
    case "green":
      return {
        background: "bg-green-50",
        border: "border-green-200",
        text: "text-green-900",
        description: "text-green-700",
        dot: "bg-green-500",
        button: "bg-green-600 hover:bg-green-700",
      };
    case "blue":
      return {
        background: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-900",
        description: "text-blue-700",
        dot: "bg-blue-500",
        button: "bg-blue-600 hover:bg-blue-700",
      };
    case "purple":
      return {
        background: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-900",
        description: "text-purple-700",
        dot: "bg-purple-500",
        button: "bg-purple-600 hover:bg-purple-700",
      };
    case "red":
      return {
        background: "bg-red-50",
        border: "border-red-200",
        text: "text-red-900",
        description: "text-red-700",
        dot: "bg-yellow-500",
        button: "bg-red-600 hover:bg-red-700",
      };
    case "orange":
      return {
        background: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-900",
        description: "text-orange-700",
        dot: "bg-orange-500",
        button: "bg-orange-600 hover:bg-orange-700",
      };
    default:
      return {
        background: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-900",
        description: "text-slate-700",
        dot: "bg-slate-500",
        button: "bg-slate-600 hover:bg-slate-700",
      };
  }
}
