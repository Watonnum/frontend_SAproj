import Card, { CardHeader, CardTitle, CardContent } from "../components/Card";
import { Bell } from "lucide-react";
import Search from "@/components/Search";
import { FaDollarSign } from "react-icons/fa6";
import Table from "../components/Table";

export default function Home() {
  const mock_Stat = [
    {
      _id: 1,
      label: "Total Revenue",
      value: "XXX,XXX",
      icon: <FaDollarSign className="h-8 mr-4" />,
    },
    {
      _id: 2,
      label: "Avg. Order Value",
      value: "XXX,XXX",
    },
    {
      _id: 3,
      label: "Total Shipment",
      value: "XXX,XXX",
    },
  ];

  const mock_customers = [
    {
      _id: 1,
      customer: {
        userId: "usr1",
        name: "Jackson schoolBoi",
        email: "adamcorktail@gmail.com",
        last_active: new Date(),
      },
      status: true,
      subcription: true,
    },
    {
      _id: 2,
      customer: {
        userId: "usr2",
        name: "Watanyu onnum",
        email: "ipae.wo@gmail.com",
        last_active: new Date(),
      },
      status: true,
      subcription: false,
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Head */}
      <CardHeader className="flex justify-between">
        <CardTitle>
          <p className="text-3xl">Welcomeback Boss</p>
          <p className="text-ls font-light text-gray-600">
            Welcome to the Dashboard
          </p>
        </CardTitle>
        <CardTitle className="flex justify-center items-center">
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
              />
            </div>
            <div className="gap-0 w-20">
              <p className="text-lg font-bold font-serif">Boss</p>
              <p className="text-sm text-gray-600 font-normal">Admin</p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      {/* Content */}
      <div className="grid grid-rows-2 gap-4">
        {/* Serching Component */}
        <CardContent className="grid grid-row-3 gap-4">
          <div className="flex w-1/5">
            <Search />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {/* map */}
            {mock_Stat.map((item, index) => {
              return (
                <Card key={index}>
                  <p className="text-xl font-light opacity-90">Total Revenue</p>
                  <CardContent className="my-4 text-2xl flex">
                    <div>{item?.icon}</div>
                    <p>{item?.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Transaction activity */}
          <Card className="">
            <CardHeader>
              <CardTitle>Transaction Activity</CardTitle>
              <CardContent className="h-56" />
            </CardHeader>
          </Card>
        </CardContent>

        {/* Customers detail */}
        <Card>
          <CardHeader>
            <CardTitle>Customers detail</CardTitle>
          </CardHeader>
          <CardContent>
            <Table sourceData={mock_customers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
