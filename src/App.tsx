import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHostTheme } from "@/hooks/useHostTheme";
import { AlertCircle, Code, Copy, Download, FileText, RefreshCw, Upload, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

const sampleCsvData = `name,age,email,city,occupation
John Doe,28,john.doe@email.com,New York,Software Engineer
Jane Smith,34,jane.smith@email.com,Los Angeles,Product Manager
Mike Johnson,25,mike.johnson@email.com,Chicago,Data Analyst
Sarah Williams,31,sarah.williams@email.com,San Francisco,UX Designer
David Brown,29,david.brown@email.com,Seattle,DevOps Engineer`;

function App() {
  const theme = useHostTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const [csvInput, setCsvInput] = useState(sampleCsvData);
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const csvToJson = (csv: string): string => {
    if (!csv.trim()) {
      throw new Error("CSV input is empty");
    }

    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(",").map((header) => header.trim());
    const jsonArray = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim());

      if (values.length !== headers.length) {
        throw new Error(
          `Row ${i + 1} has ${values.length} columns, but header has ${headers.length} columns`
        );
      }

      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        let value: any = values[index];

        if (!isNaN(Number(value)) && value !== "") {
          value = Number(value);
        } else if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
          value = value.toLowerCase() === "true";
        } else if (value.toLowerCase() === "null" || value === "") {
          value = null;
        }

        obj[header] = value;
      });
      jsonArray.push(obj);
    }

    return JSON.stringify(jsonArray, null, 2);
  };

  const handleParse = async () => {
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = csvToJson(csvInput);
      setJsonOutput(result);
      toast.success("CSV has been successfully converted to JSON");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setJsonOutput("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast.success("JSON output copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("JSON file has been downloaded");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvInput(content);
        setJsonOutput("");
        setError("");
      };
      reader.readAsText(file);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };

  const handleReset = () => {
    setCsvInput(sampleCsvData);
    setJsonOutput("");
    setError("");
  };

  const formatJsonWithSyntaxHighlighting = (jsonString: string) => {
    return jsonString
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: null/g, ': <span class="json-null">null</span>');
  };

  return (
    <div className="min-h-screen bg-muted text-primary flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl px-2 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">JSON Parser</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              CSV Input
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs"
            >
              <Code className="w-3 h-3 mr-1" />
              JSON Output
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2 text-center md:text-left">
          Convert your CSV data to JSON format with ease.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CSV Input Section */}
          <div className="h-[calc(100vh-12rem)]">
            <div className="bg-card rounded-lg shadow-lg h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-primary">CSV Input</h2>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2">
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-border hover:border-primary hover:text-primary px-2 py-1 text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-border hover:border-primary hover:text-primary px-2 py-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>

                <Textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Enter CSV data..."
                  className="min-h-[80px] flex-1 bg-muted border-border font-dmsans text-xs text-primary resize-none"
                  style={{ lineHeight: "1.2" }}
                />
              </div>
              <div className="p-4 border-">
                <Button
                  onClick={handleParse}
                  disabled={isLoading || !csvInput.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-background font-semibold text-xs py-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Convert
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* JSON Output Section */}
          <div className="h-[calc(100vh-12rem)]">
            <div className="bg-card rounded-lg shadow-lg h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-primary">JSON Output</h2>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2">
                {error && (
                  <div className="flex items-center gap-1 border border-destructive/50 bg-destructive/10 py-1 px-2 rounded-md">
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    <span className="text-destructive text-xs">{error}</span>
                  </div>
                )}

                {jsonOutput && !error && (
                  <div className="flex gap-1 mb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="border-border hover:border-primary hover:text-primary px-2 py-1 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="border-border hover:border-primary hover:text-primary px-2 py-1 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}

                <div className="flex-1 bg-muted border border-border rounded-md p-2 overflow-auto">
                  {jsonOutput ? (
                    <div className="flex h-40 items-start gap-1">
                      <pre
                        className="text-xs font-dmsans whitespace-pre-wrap text-primary m-0"
                        style={{ lineHeight: "1.2" }}
                        dangerouslySetInnerHTML={{
                          __html: formatJsonWithSyntaxHighlighting(jsonOutput),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-6">
                      <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">JSON output will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
