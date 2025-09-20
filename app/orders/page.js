import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import Table from "@/components/Table";
import { fetchProducts } from "@/hooks/useProducts";

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="w-1/2">Orders</CardTitle>
          </CardHeader>
          <CardContent>{/* TODO: Orders table */}</CardContent>
        </Card>
      </main>
    </div>
  );
}
