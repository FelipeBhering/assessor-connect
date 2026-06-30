import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { pipeline, pipelineStages, type PipelineStage } from "@/lib/mock-data";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — AssessorCRM" },
      { name: "description", content: "Funil de aquisição e crescimento dos seus clientes." },
    ],
  }),
  component: PipelinePage,
});

const stageAccent: Record<PipelineStage, string> = {
  "Prospect": "bg-info/15 text-info",
  "KYC": "bg-info/15 text-info",
  "Análise de Risco": "bg-warning/15 text-warning-foreground",
  "Assinatura": "bg-warning/15 text-warning-foreground",
  "Primeiro Aporte": "bg-accent/15 text-accent",
  "Crescimento": "bg-success/15 text-success",
  "Reativação": "bg-destructive/15 text-destructive",
};

function PipelinePage() {
  return (
    <AppShell title="Pipeline">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pipeline.length} oportunidades no funil</p>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="size-4" /> Novo card</Button>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-4 min-w-max pb-2">
            {pipelineStages.map((stage) => {
              const cards = pipeline.filter((p) => p.stage === stage);
              const stageTotal = cards.reduce((s, c) => s + c.estimatedAum, 0);
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageAccent[stage]}`}>{stage}</span>
                      <span className="text-xs text-muted-foreground">{cards.length}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatBRL(stageTotal, { compact: true })}</span>
                  </div>
                  <div className="space-y-2 bg-muted/40 rounded-lg p-2 min-h-[200px]">
                    {cards.map((card) => (
                      <Card key={card.id} className="p-3 shadow-card border-border/60 cursor-grab hover:shadow-card-hover transition-shadow">
                        <div className="flex items-start gap-2">
                          <GripVertical className="size-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{card.clientName}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{formatBRL(card.estimatedAum, { compact: true })} estimado</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px]">{card.origin}</Badge>
                              <span className="text-[10px] text-muted-foreground ml-auto">{card.daysInStage}d</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {cards.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">Sem cards</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
