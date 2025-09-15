// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Header from "../../../components/Header";
// import Card, {
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "../../../components/Card";
// import Button from "../../../components/Button";
// import Input from "../../../components/Input";
// import Select from "../../../components/Select";
// import { useProduct, useProducts } from "../../../hooks/useProducts";
// import LoadingSpinner from "../../../components/LoadingSpinner";
// import Toast from "../../../components/Toast";

// export default function EditPage() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params.id;

//   const [loading, setLoading] = useState(false);
//   const [dataLoading, setDataLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     price: "",
//     stock: "",
//     status: "active",
//     description: "",
//   });
//   const [errors, setErrors] = useState({});

//   const categories = [
//     { value: "electronics", label: "อิเล็กทรอนิกส์" },
//     { value: "clothing", label: "เสื้อผ้า" },
//     { value: "books", label: "หนังสือ" },
//     { value: "food", label: "อาหาร" },
//     { value: "home_goods", label: "ของใช้ในบ้าน" },
//     { value: "sports", label: "กีฬา" },
//   ];

//   const statusOptions = [
//     { value: "active", label: "ใช้งาน" },
//     { value: "inactive", label: "ไม่ใช้งาน" },
//   ];

//   useEffect(() => {
//     if (product) {
//       setFormData({
//         name: product.name || "",
//         category: product.category || "",
//         price: product.price?.toString() || "",
//         stock: product.stock?.toString() || "",
//         status: product.status || "active",
//         description: product.description || "",
//       });
//     }
//   }, [product]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "กรุณากรอกชื่อสินค้า";
//     }

//     if (!formData.category) {
//       newErrors.category = "กรุณาเลือกหมวดหมู่";
//     }

//     if (
//       !formData.price ||
//       isNaN(formData.price) ||
//       parseFloat(formData.price) <= 0
//     ) {
//       newErrors.price = "กรุณากรอกราคาที่ถูกต้อง";
//     }

//     if (
//       !formData.stock ||
//       isNaN(formData.stock) ||
//       parseInt(formData.stock) < 0
//     ) {
//       newErrors.stock = "กรุณากรอกจำนวนสต็อกที่ถูกต้อง";
//     }

//     if (formData.description && formData.description.length > 500) {
//       newErrors.description = "คำอธิบายต้องไม่เกิน 500 ตัวอักษร";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1500));

//       // Here you would normally send data to your backend
//       console.log("Form updated:", { id, ...formData });

//       // Redirect to data page
//       router.push("/data");
//     } catch (error) {
//       console.error("Error updating form:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     // Mock data - need to re-fetch in real app
//     const mockData = {
//       1: {
//         id: 1,
//         name: "สินค้า A",
//         category: "อิเล็กทรอนิกส์",
//         price: "1500",
//         stock: "10",
//         status: "active",
//         description: "สินค้าอิเล็กทรอนิกส์คุณภาพดี",
//       },
//       2: {
//         id: 2,
//         name: "สินค้า B",
//         category: "เสื้อผ้า",
//         price: "800",
//         stock: "25",
//         status: "active",
//         description: "เสื้อผ้าแฟชั่น",
//       },
//       3: {
//         id: 3,
//         name: "สินค้า C",
//         category: "อิเล็กทรอนิกส์",
//         price: "2200",
//         stock: "5",
//         status: "inactive",
//         description: "สินค้าเทคโนโลยี",
//       },
//       4: {
//         id: 4,
//         name: "สินค้า D",
//         category: "หนังสือ",
//         price: "350",
//         stock: "50",
//         status: "active",
//         description: "หนังสือความรู้",
//       },
//       5: {
//         id: 5,
//         name: "สินค้า E",
//         category: "อาหาร",
//         price: "120",
//         stock: "100",
//         status: "active",
//         description: "อาหารเสริม",
//       },
//     };

//     // Reset to original data
//     const originalData = mockData[id];
//     if (originalData) {
//       setFormData({
//         name: originalData.name,
//         category: originalData.category,
//         price: originalData.price,
//         stock: originalData.stock,
//         status: originalData.status,
//         description: originalData.description || "",
//       });
//     }
//     setErrors({});
//   };

//   if (dataLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">แก้ไขข้อมูล</h1>
//           <p className="text-gray-600 mt-1">แก้ไขข้อมูลสินค้า ID: {id}</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-6">
//             {/* Basic Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Input
//                     label="ชื่อสินค้า"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="ระบุชื่อสินค้า"
//                     required
//                     error={errors.name}
//                   />

//                   <Select
//                     label="หมวดหมู่"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     options={categories}
//                     placeholder="เลือกหมวดหมู่สินค้า"
//                     required
//                     error={errors.category}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Pricing and Inventory */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>ราคาและสต็อก</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Input
//                     label="ราคา (บาท)"
//                     name="price"
//                     type="number"
//                     value={formData.price}
//                     onChange={handleChange}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                     required
//                     error={errors.price}
//                   />

//                   <Input
//                     label="จำนวนสต็อก"
//                     name="stock"
//                     type="number"
//                     value={formData.stock}
//                     onChange={handleChange}
//                     placeholder="0"
//                     min="0"
//                     required
//                     error={errors.stock}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Status and Description */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>สถานะและรายละเอียด</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-6">
//                   <Select
//                     label="สถานะ"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     options={statusOptions}
//                     required
//                   />

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       คำอธิบาย (ไม่บังคับ)
//                     </label>
//                     <textarea
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                       placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสินค้า..."
//                       rows={4}
//                       className={`
//                         w-full px-3 py-2 border rounded-lg shadow-sm
//                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                         ${
//                           errors.description
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         }
//                       `}
//                       maxLength={500}
//                     />
//                     <div className="flex justify-between items-center mt-1">
//                       {errors.description && (
//                         <p className="text-sm text-red-600">
//                           {errors.description}
//                         </p>
//                       )}
//                       <p className="text-sm text-gray-500 ml-auto">
//                         {formData.description.length}/500 ตัวอักษร
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Form Actions */}
//             <Card>
//               <CardContent>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-end">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handleReset}
//                     disabled={loading}
//                   >
//                     รีเซ็ตข้อมูล
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     onClick={() => router.back()}
//                     disabled={loading}
//                   >
//                     ยกเลิก
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="primary"
//                     loading={loading}
//                     disabled={loading}
//                   >
//                     {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </form>

//         {/* Warning */}
//         <Card className="mt-8 bg-yellow-50 border-yellow-200">
//           <CardContent>
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-5 w-5 text-yellow-400"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-yellow-800">
//                   ข้อควรระวัง
//                 </h3>
//                 <div className="mt-2 text-sm text-yellow-700">
//                   <p>
//                     การแก้ไขข้อมูลจะมีผลต่อระบบทันที
//                     กรุณาตรวจสอบความถูกต้องก่อนบันทึก
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   );
// }
