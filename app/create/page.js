"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useProducts } from "../../hooks/useProducts";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";

export default function CreatePage() {
  const router = useRouter();
  const { createProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "", // เปลี่ยนจาก "active" เป็น "available" ตาม backend
    description: "",
    manufactureDate: "",
    expirationDate: "",
    serialNumber: "",
    company: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // แสดง Toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const categories = [
    { value: "electronics", label: "อิเล็กทรอนิกส์" },
    { value: "clothing", label: "เสื้อผ้า" },
    { value: "books", label: "หนังสือ" },
    { value: "food", label: "อาหาร" },
    { value: "home_goods", label: "ของใช้ในบ้าน" },
    { value: "sports", label: "กีฬา" },
  ];

  const statusOptions = [
    { value: "active", label: "พร้อมขาย" },
    { value: "inactive", label: "ไม่พร้อมขาย" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อสินค้า";
    }

    if (!formData.category) {
      newErrors.category = "กรุณาเลือกหมวดหมู่";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "กรุณากรอกราคาที่ถูกต้อง";
    }

    if (
      !formData.stock ||
      isNaN(formData.stock) ||
      parseInt(formData.stock) < 0
    ) {
      newErrors.stock = "กรุณากรอกจำนวนสต็อกที่ถูกต้อง";
    }

    if (!formData.manufactureDate) {
      newErrors.manufactureDate = "กรุณาเลือกวันที่ผลิต";
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = "กรุณาเลือกวันหมดอายุ";
    }

    // ตรวจสอบว่าวันหมดอายุต้องมากกว่าวันที่ผลิต
    if (formData.manufactureDate && formData.expirationDate) {
      if (
        new Date(formData.expirationDate) <= new Date(formData.manufactureDate)
      ) {
        newErrors.expirationDate = "วันหมดอายุต้องมากกว่าวันที่ผลิต";
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "คำอธิบายต้องไม่เกิน 500 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // เตรียมข้อมูลส่งไป API ตามโครงสร้างของ backend
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        status: formData.status,
        serialNumber: formData.serialNumber.trim() || undefined,
        product_information: {
          company: formData.company.trim() || undefined,
          details: formData.description.trim() || undefined,
        },
        expiration_date: {
          product_manufacture: new Date(formData.manufactureDate).toISOString(),
          product_expire: new Date(formData.expirationDate).toISOString(),
        },
      };

      console.log("Sending product data to backend:", productData);

      // เรียก API สร้างสินค้าใหม่
      await createProduct(productData);

      showToast("สร้างข้อมูลสำเร็จ", "success");

      // รอ 1 วินาทีแล้วไปหน้า data
      setTimeout(() => {
        router.push("/data");
      }, 1000);
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("เกิดข้อผิดพลาดในการสร้างข้อมูล", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      status: "available",
      description: "",
      manufactureDate: "",
      expirationDate: "",
      serialNumber: "",
      company: "",
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "info" })}
          />
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">เพิ่มข้อมูลใหม่</h1>
          <p className="text-gray-600 mt-1">
            กรอกข้อมูลสินค้าที่ต้องการเพิ่มในระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="ชื่อสินค้า"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ระบุชื่อสินค้า"
                    required
                    error={errors.name}
                    className="text-black opacity-40"
                  />

                  <Select
                    label="หมวดหมู่"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categories}
                    placeholder="เลือกหมวดหมู่สินค้า"
                    required
                    error={errors.category}
                    className="text-black opacity-40"
                  />

                  <Input
                    label="วันที่ผลิต"
                    name="manufactureDate"
                    type="date"
                    value={formData.manufactureDate}
                    onChange={handleChange}
                    required
                    error={errors.manufactureDate}
                    className="text-black opacity-40"
                  />

                  <Input
                    label="วันหมดอายุ"
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    required
                    error={errors.expirationDate}
                    className="text-black opacity-40"
                  />

                  <Input
                    label="หมายเลขผลิตภัณฑ์ (ไม่บังคับ)"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="ระบุหมายเลขผลิตภัณฑ์"
                    error={errors.serialNumber}
                    className="text-black opacity-40"
                  />

                  <Input
                    label="บริษัทผู้ผลิต (ไม่บังคับ)"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="ระบุชื่อบริษัทผู้ผลิต"
                    error={errors.company}
                    className="text-black opacity-40"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>ราคาและสต็อก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="ราคา (บาท)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    error={errors.price}
                  />

                  <Input
                    label="จำนวนสต็อก"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                    error={errors.stock}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status and Description */}
            <Card>
              <CardHeader>
                <CardTitle>สถานะและรายละเอียด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Select
                    label="สถานะ"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย (ไม่บังคับ)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสินค้า..."
                      rows={4}
                      className={`
                        w-full px-3 py-2 border rounded-lg shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                      `}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description && (
                        <p className="text-sm text-red-600">
                          {errors.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 ml-auto">
                        {formData.description.length}/500 ตัวอักษร
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    รีเซ็ตฟอร์ม
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  เคล็ดลับการกรอกข้อมูล
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>ตรวจสอบความถูกต้องของชื่อสินค้าและหมวดหมู่</li>
                    <li>ราคาและสต็อกต้องเป็นตัวเลขเท่านั้น</li>
                    <li>คำอธิบายช่วยให้ลูกค้าเข้าใจสินค้าได้ดีขึ้น</li>
                    <li>
                      สถานะ &ldquo;ไม่ใช้งาน&rdquo; จะทำให้สินค้าไม่แสดงในระบบ
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
