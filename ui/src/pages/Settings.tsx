import { useEffect, useState } from "react";
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
import { getSetting, updateSetting, createSetting } from "@/lib/setting";

// 🧾 Domain name list
const DOMAIN_NAMES = [
  { name: "Together AI", value: "togetherai" },
  { name: "OpenAI", value: "openai" },
  { name: "Anthropic", value: "anthropic" },
  { name: "Google", value: "google" },
];

// 🤖 Top model list
const TOP_MODELS = [
  { name: "Llama 3.3 70B Instruct Turbo", api: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  { name: "DeepSeek R1 Distill Llama 70B", api: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B" },
  { name: "Qwen3 235B-A22B Instruct 2507", api: "Qwen/Qwen3-235B-A22B-Instruct-2507-tput" },
  { name: "Kimi K2 Instruct", api: "moonshotai/Kimi-K2-Instruct" },
  { name: "Mistral Small 24B Instruct", api: "mistralai/Mistral-Small-24B-Instruct-2501" },
];

export default function Settings() {
  const [lineBotSetting, setLineBotSetting] = useState(false);
  // const [facebookBotSetting, setFacebookBotSetting] = useState(false);
  // const [greetingMode, setGreetingMode] = useState(false);
  // const [productSetting, setProductSetting] = useState(false);
  // const [feedbackReportSetting, setFeedbackReportSetting] = useState(false);

  const [serverType, setServerType] = useState<"api" | "local">("local");
  const [domainName, setDomainName] = useState(DOMAIN_NAMES[0].value);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(TOP_MODELS[0].api);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const setting = await getSetting();
        if (setting) {
          if (setting.modelName) setModelName(setting.modelName);
          if (setting.apiKey) setApiKey(setting.apiKey);
          if (setting.domainName) setDomainName(setting.domainName);
          if (setting.isApi) setServerType("api");
          if (setting.isLocal) setServerType("local");
        }
      } catch {
        // no setting yet
      }
    })();
  }, []);

  async function handleSave() {
    setLoading(true);
    const payload = {
      modelName,
      domainName,
      apiKey: apiKey || null,
      isApi: serverType === "api",
      isLocal: serverType === "local",
    };
    try {
      const existing = await getSetting();
      if (existing) await updateSetting(payload);
      else await createSetting(payload);
      alert("✅ Setting saved");
    } catch {
      alert("❌ Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Setting</h1>

        <div className="space-y-6">
          {/* Bot Toggles */}
          <div className="bg-card rounded-lg shadow-soft border p-6">
            <div className="space-y-6">
              {[
                { label: "Line Bot Setting", desc: "Enable Line Issue Token", state: lineBotSetting, setState: setLineBotSetting },
                // { label: "Facebook Bot Setting", desc: "Enable Facebook Issue Token", state: facebookBotSetting, setState: setFacebookBotSetting },
                // { label: "Greeting Mode", desc: "First Conversation with AI", state: greetingMode, setState: setGreetingMode },
                // { label: "Product Setting", desc: "Enable Product Placement in Answer", state: productSetting, setState: setProductSetting },
                // { label: "Feedback Report Setting", desc: "Create feedback report from user", state: feedbackReportSetting, setState: setFeedbackReportSetting },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.state} onCheckedChange={item.setState} />
                </div>
              ))}
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
                    <Select value={domainName} onValueChange={setDomainName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Domain Name" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {DOMAIN_NAMES.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apikey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apikey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter API Key"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model Name</Label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Model Name" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {TOP_MODELS.map((m) => (
                          <SelectItem key={m.api} value={m.api}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {serverType === "local" && (
                <div className="space-y-2">
                  <Label htmlFor="localmodel">Model Name</Label>
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Local Model" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="llama3-8b">llama3:8b</SelectItem>
                      <SelectItem value="llama3-13b">llama3:13b</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
