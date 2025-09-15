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

//   const {
//     product,
//     loading: productLoading,
//     error: productError,
//   } = useProduct(id);
//   const { updateProduct } = useProducts();

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     price: "",
//     stock: "",
//     status: "active",
//     description: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "info",
//   });

//   // แสดง Toast notification
//   const showToast = (message, type = "info") => {
//     setToast({ show: true, message, type });
//     setTimeout(
//       () => setToast({ show: false, message: "", type: "info" }),
//       3000
//     );
//   };

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

//   // โหลดข้อมูลเมื่อได้ product มา
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
//       // เตรียมข้อมูลส่งไป API
//       const productData = {
//         name: formData.name.trim(),
//         category: formData.category,
//         price: parseFloat(formData.price),
//         stock: parseInt(formData.stock),
//         status: formData.status,
//         description: formData.description.trim(),
//       };

//       // เรียก API อัพเดทสินค้า
//       await updateProduct(id, productData);

//       showToast("อัพเดทข้อมูลสำเร็จ", "success");

//       // รอ 1 วินาทีแล้วไปหน้า data
//       setTimeout(() => {
//         router.push("/data");
//       }, 1000);
//     } catch (error) {
//       showToast("เกิดข้อผิดพลาดในการอัพเดทข้อมูล", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
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
//     setErrors({});
//   };

//   if (productLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex justify-center items-center py-8">
//             <LoadingSpinner />
//           </div>
//         </main>
//       </div>
//     );
//   }

//   if (productError) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <p className="text-red-600">{productError}</p>
//             <Button
//               onClick={() => router.push("/data")}
//               variant="outline"
//               className="mt-4"
//             >
//               กลับไปหน้าข้อมูล
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <p className="text-gray-600">ไม่พบข้อมูลสินค้า</p>
//             <Button
//               onClick={() => router.push("/data")}
//               variant="outline"
//               className="mt-4"
//             >
//               กลับไปหน้าข้อมูล
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Toast Notification */}
//         {toast.show && (
//           <Toast
//             message={toast.message}
//             type={toast.type}
//             onClose={() => setToast({ show: false, message: "", type: "info" })}
//           />
//         )}

//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">แก้ไขข้อมูล</h1>
//           <p className="text-gray-600 mt-1">
//             แก้ไขข้อมูลสินค้า: {formData.name}
//           </p>
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
//                     placeholder="เลือกหมวดหมู่"
//                     required
//                     error={errors.category}
//                   />

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

//                   <div className="md:col-span-2">
//                     <Select
//                       label="สถานะ"
//                       name="status"
//                       value={formData.status}
//                       onChange={handleChange}
//                       options={statusOptions}
//                       required
//                       error={errors.status}
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Additional Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       คำอธิบาย
//                     </label>
//                     <textarea
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                       placeholder="ระบุคำอธิบายสินค้า (ไม่เกิน 500 ตัวอักษร)"
//                       rows={4}
//                       maxLength={500}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <div className="flex justify-between mt-1">
//                       <span className="text-red-500 text-sm">
//                         {errors.description}
//                       </span>
//                       <span className="text-gray-500 text-sm">
//                         {formData.description.length}/500
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-end">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => router.push("/data")}
//                 disabled={loading}
//               >
//                 ยกเลิก
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleReset}
//                 disabled={loading}
//               >
//                 รีเซ็ต
//               </Button>
//               <Button
//                 type="submit"
//                 variant="primary"
//                 disabled={loading}
//                 className="min-w-[120px]"
//               >
//                 {loading ? (
//                   <div className="flex items-center">
//                     <LoadingSpinner size="sm" />
//                     <span className="ml-2">บันทึก...</span>
//                   </div>
//                 ) : (
//                   "บันทึกการแก้ไข"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </form>

//         {/* Warning */}
//         <Card className="mt-6">
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
