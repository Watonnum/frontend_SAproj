import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";

export default function CustomersPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Customers list */}
            <div className="brand-text-muted">Coming soon…</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
