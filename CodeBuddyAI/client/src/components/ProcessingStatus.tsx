import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusText } from "@/lib/utils";

interface ProcessingStatusProps {
  userStoryId: number | null;
}

export default function ProcessingStatus({ userStoryId }: ProcessingStatusProps) {
  const { data: jobs } = useQuery({
    queryKey: ["/api/user-stories", userStoryId, "jobs"],
    enabled: !!userStoryId,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  const getProcessingStages = () => {
    if (!userStoryId) {
      return [
        { name: "Story Analysis", status: "pending" },
        { name: "Requirements Extraction", status: "pending" },
        { name: "Context Understanding", status: "pending" },
      ];
    }

    // NLP processing is completed when user story is created
    const nlpStages = [
      { name: "Story Analysis", status: "completed" },
      { name: "Requirements Extraction", status: "completed" },
      { name: "Context Understanding", status: "completed" },
    ];

    return nlpStages;
  };

  const getCodeGenerationStages = () => {
    if (!userStoryId || !jobs || !Array.isArray(jobs)) {
      return [
        { name: "Component Structure", status: "pending" },
        { name: "Business Logic", status: "pending" },
        { name: "Validation Logic", status: "pending" },
      ];
    }

    const codeJob = jobs.find((job: any) => job.jobType === "code");
    if (!codeJob) {
      return [
        { name: "Component Structure", status: "pending" },
        { name: "Business Logic", status: "pending" },
        { name: "Validation Logic", status: "pending" },
      ];
    }

    if (codeJob.status === "processing") {
      return [
        { name: "Component Structure", status: "processing" },
        { name: "Business Logic", status: "pending" },
        { name: "Validation Logic", status: "pending" },
      ];
    }

    if (codeJob.status === "completed") {
      return [
        { name: "Component Structure", status: "completed" },
        { name: "Business Logic", status: "completed" },
        { name: "Validation Logic", status: "completed" },
      ];
    }

    return [
      { name: "Component Structure", status: "failed" },
      { name: "Business Logic", status: "pending" },
      { name: "Validation Logic", status: "pending" },
    ];
  };

  const getTestGenerationStages = () => {
    if (!userStoryId || !jobs || !Array.isArray(jobs)) {
      return [
        { name: "Unit Test Cases", status: "pending" },
        { name: "Integration Tests", status: "pending" },
        { name: "E2E Test Scenarios", status: "pending" },
      ];
    }

    const testJobs = jobs.filter((job: any) => job.jobType && job.jobType.includes("tests"));
    const completedTests = testJobs.filter((job: any) => job.status === "completed").length;
    const processingTests = testJobs.filter((job: any) => job.status === "processing").length;

    if (processingTests > 0) {
      return [
        { name: "Unit Test Cases", status: "processing" },
        { name: "Integration Tests", status: "pending" },
        { name: "E2E Test Scenarios", status: "pending" },
      ];
    }

    if (completedTests > 0) {
      return [
        { name: "Unit Test Cases", status: completedTests >= 1 ? "completed" : "pending" },
        { name: "Integration Tests", status: completedTests >= 2 ? "completed" : "pending" },
        { name: "E2E Test Scenarios", status: completedTests >= 3 ? "completed" : "pending" },
      ];
    }

    return [
      { name: "Unit Test Cases", status: "pending" },
      { name: "Integration Tests", status: "pending" },
      { name: "E2E Test Scenarios", status: "pending" },
    ];
  };

  const nlpStages = getProcessingStages();
  const codeStages = getCodeGenerationStages();
  const testStages = getTestGenerationStages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProcessingCard
        title="NLP Processing"
        stages={nlpStages}
        overallStatus={nlpStages.every(s => s.status === "completed") ? "completed" : "processing"}
      />
      
      <ProcessingCard
        title="Code Generation"
        stages={codeStages}
        overallStatus={
          codeStages.some(s => s.status === "processing") ? "processing" :
          codeStages.every(s => s.status === "completed") ? "completed" :
          codeStages.some(s => s.status === "failed") ? "failed" : "pending"
        }
      />
      
      <ProcessingCard
        title="Test Generation"
        stages={testStages}
        overallStatus={
          testStages.some(s => s.status === "processing") ? "processing" :
          testStages.some(s => s.status === "completed") ? "completed" : "pending"
        }
      />
    </div>
  );
}

interface ProcessingCardProps {
  title: string;
  stages: Array<{ name: string; status: string }>;
  overallStatus: string;
}

function ProcessingCard({ title, stages, overallStatus }: ProcessingCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-slate-900">{title}</CardTitle>
          <div className={`w-3 h-3 ${getStatusColor(overallStatus)} rounded-full`}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{stage.name}</span>
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusBadgeClasses(stage.status)}`}
              >
                {getStatusText(stage.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-slate-100 text-slate-500";
  }
}
