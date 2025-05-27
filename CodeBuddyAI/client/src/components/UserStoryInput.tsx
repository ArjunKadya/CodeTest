import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WandSparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const userStorySchema = z.object({
  projectType: z.string().min(1, "Project type is required"),
  language: z.string().min(1, "Language is required"),
  story: z.string().min(10, "User story must be at least 10 characters"),
});

type UserStoryForm = z.infer<typeof userStorySchema>;

interface UserStoryInputProps {
  onUserStoryCreated: (id: number) => void;
}

export default function UserStoryInput({ onUserStoryCreated }: UserStoryInputProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<UserStoryForm>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      projectType: "",
      language: "",
      story: "",
    },
  });

  const createUserStoryMutation = useMutation({
    mutationFn: async (data: UserStoryForm) => {
      const response = await apiRequest("POST", "/api/user-stories", data);
      return response.json();
    },
    onSuccess: (userStory) => {
      toast({
        title: "User story created",
        description: "Your user story has been processed with NLP.",
      });
      onUserStoryCreated(userStory.id);
      queryClient.invalidateQueries({ queryKey: ["/api/user-stories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserStoryForm) => {
    createUserStoryMutation.mutate(data);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">User Story Input</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-slate-500">NLP Ready</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Project Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="web-application">Web Application</SelectItem>
                      <SelectItem value="api-service">API Service</SelectItem>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="desktop-application">Desktop Application</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Programming Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript/TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">User Story</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-40 resize-none"
                      placeholder="As a user, I want to be able to register for an account so that I can access personalized features.

Example format:
- As a [user type], I want [functionality] so that [benefit]
- Acceptance criteria: [list specific requirements]
- Business rules: [any constraints or rules]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={createUserStoryMutation.isPending}
              >
                <WandSparkles className="w-4 h-4 mr-2" />
                {createUserStoryMutation.isPending ? "Processing..." : "Create Story"}
              </Button>
              <Button type="button" variant="outline" size="icon">
                <Save className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <WandSparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-600">NLP Processing:</strong> Our AI will analyze your user story structure, extract key requirements, and generate appropriate code patterns.
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
