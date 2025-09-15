"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Modal from "../../components/Modal";
import { useProducts } from "../../hooks/useProducts";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";

export default function DataPage() {
  // ใช้ custom hook สำหรับจัดการ products
  const { products, loading, error, deleteProduct } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // แปลงข้อมูล products เพื่อให้ตรงกับ format เดิม
  const data = products.map((product) => ({
    id: product._id,
    name: product.name || "",
    category: product.category || "",
    price: product.price || 0,
    stock: product.stock || 0,
    status: product.status || "available",
    company: product.product_information?.company || "",
    serialNumber: product.serialNumber || "",
    manufactureDate: product.expiration_date?.product_manufacture
      ? new Date(product.expiration_date.product_manufacture)
          .toISOString()
          .split("T")[0]
      : "",
    expireDate: product.expiration_date?.product_expire
      ? new Date(product.expiration_date.product_expire)
          .toISOString()
          .split("T")[0]
      : "",
    createdAt: product.createdAt
      ? new Date(product.createdAt).toISOString().split("T")[0]
      : "",
  }));

  // ดึง categories ที่ไม่ซ้ำกันจากข้อมูล
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ].map((cat) => ({ value: cat, label: cat }));

  const statusOptions = [
    { value: "available", label: "พร้อมขาย" },
    { value: "unavailable", label: "ไม่พร้อมขาย" },
  ];

  // แสดง Toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  // Filter and sort data
  const filteredData = data.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteModal.item.id);
      showToast("ลบข้อมูลสำเร็จ", "success");
      setDeleteModal({ isOpen: false, item: null });
    } catch (error) {
      showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "info" })}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูล</h1>
              <p className="text-gray-600 mt-1">
                ข้อมูลทั้งหมด {sortedData.length} รายการ
              </p>
            </div>
            <Link href="/create">
              <Button variant="primary">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                เพิ่มข้อมูลใหม่
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>ค้นหาและกรองข้อมูล</CardTitle>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                รีเซ็ตตัวกรอง
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="ค้นหาชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-0"
              />

              <Select
                placeholder="เลือกหมวดหมู่"
                options={categories}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mb-0"
              />

              <Select
                placeholder="เลือกสถานะ"
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mb-0"
              />

              <Select
                placeholder="เรียงตาม"
                options={[
                  { value: "name", label: "ชื่อ" },
                  { value: "price", label: "ราคา" },
                  { value: "stock", label: "สต็อก" },
                  { value: "createdAt", label: "วันที่สร้าง" },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mb-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ชื่อสินค้า</span>
                        {sortBy === "name" && (
                          <svg
                            className={`w-4 h-4 ${
                              sortOrder === "asc" ? "transform rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมวดหมู่
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ราคา</span>
                        {sortBy === "price" && (
                          <svg
                            className={`w-4 h-4 ${
                              sortOrder === "asc" ? "transform rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>สต็อก</span>
                        {sortBy === "stock" && (
                          <svg
                            className={`w-4 h-4 ${
                              sortOrder === "asc" ? "transform rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันหมดอายุ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status === "active"
                            ? "พร้อมขาย"
                            : "ไม่พร้อมขาย"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.expireDate ? (
                          <span
                            className={`${
                              new Date(item.expireDate) < new Date()
                                ? "text-red-600 font-semibold"
                                : new Date(item.expireDate) <
                                  new Date(
                                    Date.now() + 30 * 24 * 60 * 60 * 1000
                                  )
                                ? "text-orange-600 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {new Date(item.expireDate).toLocaleDateString(
                              "th-TH"
                            )}
                            {new Date(item.expireDate) < new Date() &&
                              " (หมดอายุแล้ว)"}
                            {new Date(item.expireDate) >= new Date() &&
                              new Date(item.expireDate) <
                                new Date(
                                  Date.now() + 30 * 24 * 60 * 60 * 1000
                                ) &&
                              " (ใกล้หมดอายุ)"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("th-TH")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/edit/${item.id}`}>
                            <Button variant="outline" size="sm">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              แก้ไข
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item)}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            ลบ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    แสดง {startIndex + 1} ถึง{" "}
                    {Math.min(endIndex, sortedData.length)} จาก{" "}
                    {sortedData.length} รายการ
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ก่อนหน้า
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        title="ยืนยันการลบ"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            คุณต้องการลบข้อมูลนี้หรือไม่?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {deleteModal.item &&
              `"${deleteModal.item.name}" จะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้`}
          </p>
          <div className="flex space-x-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, item: null })}
            >
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              ลบข้อมูล
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
