import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor, getStatusText } from "@/lib/utils";

export default function OllamaStatus() {
  const { data: status } = useQuery({
    queryKey: ["/api/ollama/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const services = [
    {
      name: "Code Generation Model",
      status: status?.codeGenerationModel?.status || "offline",
      model: status?.codeGenerationModel?.model || "CodeLlama-7B",
    },
    {
      name: "Test Generation Model",
      status: status?.testGenerationModel?.status || "offline",
      model: status?.testGenerationModel?.model || "CodeLlama-7B",
    },
    {
      name: "NLP Pipeline",
      status: status?.nlpPipeline?.status || "offline",
      model: status?.nlpPipeline?.model || "BERT-Base",
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900">Ollama LLM Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{service.name}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 ${getStatusColor(service.status)} rounded-full`}></div>
                <span className={`text-xs ${getStatusTextColor(service.status)}`}>
                  {getStatusText(service.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case "online":
    case "ready":
      return "text-green-600";
    case "processing":
      return "text-blue-600";
    case "offline":
    case "failed":
      return "text-red-600";
    default:
      return "text-slate-500";
  }
}
