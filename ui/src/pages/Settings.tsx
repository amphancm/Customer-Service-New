import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";

export default function Settings() {
  const [lineBotSetting, setLineBotSetting] = useState(false);
  const [facebookBotSetting, setFacebookBotSetting] = useState(false);
  const [greetingMode, setGreetingMode] = useState(false);
  const [productSetting, setProductSetting] = useState(false);
  const [feedbackReportSetting, setFeedbackReportSetting] = useState(false);
  const [serverType, setServerType] = useState("local");
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <Layout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Setting</h1>

        <div className="space-y-6">
          {/* Toggle Settings */}
          <div className="bg-card rounded-lg shadow-soft border p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Line Bot Setting</Label>
                  <p className="text-sm text-muted-foreground">Enable Line Issue Token</p>
                </div>
                <Switch
                  checked={lineBotSetting}
                  onCheckedChange={setLineBotSetting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Facebook Bot Setting</Label>
                  <p className="text-sm text-muted-foreground">Enable Facebook Issue Token</p>
                </div>
                <Switch
                  checked={facebookBotSetting}
                  onCheckedChange={setFacebookBotSetting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Greeting Mode</Label>
                  <p className="text-sm text-muted-foreground">First Conversation with AI</p>
                </div>
                <Switch
                  checked={greetingMode}
                  onCheckedChange={setGreetingMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Product Setting</Label>
                  <p className="text-sm text-muted-foreground">Enable Product Placement in Answer</p>
                </div>
                <Switch
                  checked={productSetting}
                  onCheckedChange={setProductSetting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Feedback Report Setting</Label>
                  <p className="text-sm text-muted-foreground">Create feedback report from user</p>
                </div>
                <Switch
                  checked={feedbackReportSetting}
                  onCheckedChange={setFeedbackReportSetting}
                />
              </div>
            </div>
          </div>

          {/* Server Selection */}
          <div className="bg-card rounded-lg shadow-soft border p-6">
            <h2 className="text-lg font-medium mb-4">Server Selection</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <Button
                  variant={serverType === "api" ? "default" : "outline"}
                  onClick={() => setServerType("api")}
                  className={serverType === "api" ? "bg-primary hover:bg-primary/90" : ""}
                >
                  API Model
                </Button>
                <Button
                  variant={serverType === "local" ? "default" : "outline"}
                  onClick={() => setServerType("local")}
                  className={serverType === "local" ? "bg-primary hover:bg-primary/90" : ""}
                >
                  Local Model
                </Button>
              </div>

              {serverType === "api" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Domain Name" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apikey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apikey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter API Key"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Model Name" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude-3">Claude-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {serverType === "local" && (
                <div className="space-y-2">
                  <Label htmlFor="localmodel">Model Name</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="llama3:8b" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="llama3-8b">llama3:8b</SelectItem>
                      <SelectItem value="llama3-13b">llama3:13b</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}