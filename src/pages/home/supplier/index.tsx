import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Send,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  User,
  Grid3X3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

// MetricCard Component
interface MetricCardProps {
  title: string;
  value: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
}: MetricCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          {changeType === "positive" && (
            <TrendingUp className="h-4 w-4 text-green-600" />
          )}
          {changeType === "negative" && (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span
            className={cn(
              "text-sm",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-gray-600"
            )}
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// RequestCard Component
interface RequestCardProps {
  title: string;
  client: string;
  status: "new" | "draft" | "sent";
  priority?: "high" | "medium" | "low";
}

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-800" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  sent: { label: "Sent", color: "bg-green-100 text-green-800" },
};

function RequestCard({ title, client, status, priority }: RequestCardProps) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <Badge className={statusConfig[status].color}>
              {statusConfig[status].label}
            </Badge>
          </div>
          {priority && (
            <div
              className={`w-2 h-2 rounded-full ${
                priority === "high"
                  ? "bg-red-500"
                  : priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
          )}
        </div>

        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h4>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-3 w-3" />
          <span>{client}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// RequestsSection Component
interface Request {
  id: string;
  title: string;
  client: string;
  status: "new" | "draft" | "sent";
  priority?: "high" | "medium" | "low";
}

const mockRequests: Request[] = [
  {
    id: "1",
    title: "Office Complex Downtown",
    client: "Ana Rodriguez",
    status: "new",
    priority: "high",
  },
  {
    id: "2",
    title: "North Residential Tower",
    client: "Carlos Mendez",
    status: "new",
    priority: "medium",
  },
  {
    id: "3",
    title: "Plaza Shopping Center",
    client: "Maria Santos",
    status: "draft",
    priority: "medium",
  },
  {
    id: "4",
    title: "Corporate Building",
    client: "Luis Herrera",
    status: "sent",
    priority: "low",
  },
  {
    id: "5",
    title: "Housing Complex",
    client: "Sofia Martinez",
    status: "sent",
    priority: "medium",
  },
];

function RequestsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const newRequests = mockRequests.filter((req) => req.status === "new");
  const drafts = mockRequests.filter((req) => req.status === "draft");
  const sent = mockRequests.filter((req) => req.status === "sent");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Active Requests</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">New Requests</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {newRequests.length}
            </span>
          </div>
          <div className="space-y-3">
            {newRequests.map((request) => (
              <RequestCard
                key={request.id}
                title={request.title}
                client={request.client}
                status={request.status}
                priority={request.priority}
              />
            ))}
          </div>
        </div>

        {/* Drafts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Drafts</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              {drafts.length}
            </span>
          </div>
          <div className="space-y-3">
            {drafts.map((request) => (
              <RequestCard
                key={request.id}
                title={request.title}
                client={request.client}
                status={request.status}
                priority={request.priority}
              />
            ))}
          </div>
        </div>

        {/* Sent */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Sent</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {sent.length}
            </span>
          </div>
          <div className="space-y-3">
            {sent.map((request) => (
              <RequestCard
                key={request.id}
                title={request.title}
                client={request.client}
                status={request.status}
                priority={request.priority}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function HomeSupplier() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="New Requests"
              value={8}
              change="+3 today"
              changeType="positive"
              icon={<Clock className="h-5 w-5 text-blue-600" />}
            />
            <MetricCard
              title="Sent"
              value={12}
              change="+2 since yesterday"
              changeType="positive"
              icon={<Send className="h-5 w-5 text-green-600" />}
            />
            <MetricCard
              title="Completed"
              value={45}
              change="+5 this week"
              changeType="positive"
              icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
            />
          </div>

          {/* Active Requests Section */}
          <RequestsSection />
        </main>
      </div>
    </div>
  );
}
