import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import ProtectedRoute from "@/components/ProtectedRoute";

function SettingsPageContent() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Settings form */}
            <div className="brand-text-muted">Coming soon…</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredPermission="settings:read">
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
