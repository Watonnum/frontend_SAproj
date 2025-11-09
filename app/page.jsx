import Card, { CardHeader, CardTitle, CardContent } from "../components/Card";
import { Bell } from "lucide-react";
import Search from "@/components/Search";
import { FaDollarSign } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between">
            <CardTitle>
              <p className="text-3xl">Welcomeback Boss</p>
              <p className="text-lg font-light text-gray-600">
                Welcome to the Dashboard
              </p>
            </CardTitle>
            <div className="flex justify-center items-center">
              <button
                type="button"
                className="border rounded-full opacity-40 cursor-pointer hover:opacity-100 mx-4 p-3 duration-200"
              >
                <Bell />
              </button>

              {/* Profile */}
              <div className="flex rounded-xl p-2 border border-transparent hover:border-gray-400 transition-colors cursor-pointer duration-200">
                <div className="flex gap-5 rounded-full w-12 h-12 border mr-4">
                  <img
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    width={48}
                    height={48}
                    className="rounded-full"
                    alt="Profile"
                  />
                </div>
                <div className="gap-0 w-20">
                  <p className="text-lg font-bold font-serif">Boss</p>
                  <p className="text-sm text-gray-600 font-normal">Admin</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardContent>
              <div className="w-full max-w-md">
                <Search />
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards - Placeholder for future metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold">$0</p>
                  </div>
                  <FaDollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <FaDollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Products</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <FaDollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center text-gray-500">
                  <p>Chart will be implemented here</p>
                </div>
              </CardContent>
            </Card>

            {/* Customers detail */}
            <Card>
              <CardHeader>
                <CardTitle>Customers Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center text-gray-500">
                  <p>Customer data will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
