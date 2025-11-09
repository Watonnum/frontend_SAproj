"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUsers } from "@/hooks/useUsers";

function UsersPageContent() {
  console.log("🚀 [UsersPage] Component rendering...");
  const { users, loading, error, createUsers, updateUsers, deleteUsers } =
    useUsers();
  console.log("🚀 [UsersPage] Hook result:", { users, loading, error });

  // State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // State สำหรับ Form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fName: "",
    lName: "",
    address: "",
    phoneNum: "",
    isActive: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับ Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // แปลงข้อมูล users สำหรับแสดงในตาราง
  const usersData =
    users && Array.isArray(users) && users.length > 0
      ? users.map((user) => ({
          id: user._id || "",
          email: user.email || "",
          fname: user.fName || "",
          lname: user.lName || "",
          address: user.address || "-",
          phoneNumber: user.phoneNum || "",
          createAt: user.regisDate
            ? new Date(user.regisDate).toLocaleDateString("th-TH")
            : "",
          updateAt: user.updateDate
            ? new Date(user.updateDate).toLocaleDateString("th-TH")
            : "",
          status: user.isActive ? "ใช้งาน" : "ปิดใช้งาน",
          _originalData: user,
        }))
      : [];

  // แสดง Toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      5000
    );
  };

  // ตรวจสอบความถูกต้องของ Form
  const validateForm = (data) => {
    const errors = {};

    if (!data.email.trim()) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!editingUser && !data.password.trim()) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!editingUser && data.password.length < 6) {
      errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (!data.fName.trim()) {
      errors.fName = "กรุณากรอกชื่อ";
    }

    if (!data.lName.trim()) {
      errors.lName = "กรุณากรอกนามสกุล";
    }

    if (!data.phoneNum.trim()) {
      errors.phoneNum = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^[0-9]{10}$/.test(data.phoneNum.replace(/[-\s]/g, ""))) {
      errors.phoneNum = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
    }

    return errors;
  };

  // รีเซ็ต Form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fName: "",
      lName: "",
      address: "",
      phoneNum: "",
      isActive: true,
    });
    setFormErrors({});
    setEditingUser(null);
  };

  // เปิด Modal สำหรับสร้าง User ใหม่
  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // เปิด Modal สำหรับแก้ไข User
  const handleEdit = (user) => {
    console.log("🔧 [UsersPage] Editing user:", user);
    const originalData = user._originalData;
    setEditingUser(originalData);
    setFormData({
      email: originalData.email || "",
      password: "", // ไม่แสดงรหัสผ่านเดิม
      fName: originalData.fName || "",
      lName: originalData.lName || "",
      address: originalData.address || "",
      phoneNum: originalData.phoneNum || "",
      isActive: originalData.isActive,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // เปิด Modal ยืนยันการลบ
  const handleDelete = (user) => {
    console.log("🗑️ [UsersPage] Preparing to delete user:", user);
    setUserToDelete(user._originalData);
    setIsDeleteModalOpen(true);
  };

  // บันทึกข้อมูล User
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const userData = {
        email: formData.email.trim(),
        fName: formData.fName.trim(),
        lName: formData.lName.trim(),
        address: formData.address.trim(),
        phoneNum: formData.phoneNum.trim(),
        isActive: formData.isActive,
        updateDate: new Date(),
      };

      // เพิ่มรหัสผ่านสำหรับ User ใหม่
      if (!editingUser) {
        userData.passwordHash = formData.password; // Backend จะ hash เอง
        userData.regisDate = new Date();
      }

      if (editingUser) {
        console.log("🔄 [UsersPage] Updating user:", editingUser._id, userData);
        await updateUsers(editingUser._id, userData);
        showToast("อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว", "success");
      } else {
        console.log("➕ [UsersPage] Creating new user:", userData);
        await createUsers(userData);
        showToast("สร้างผู้ใช้ใหม่เรียบร้อยแล้ว", "success");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("❌ [UsersPage] Save error:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ยืนยันการลบ User
  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      console.log("🗑️ [UsersPage] Deleting user:", userToDelete._id);
      await deleteUsers(userToDelete._id);
      showToast("ลบผู้ใช้เรียบร้อยแล้ว", "success");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("❌ [UsersPage] Delete error:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  // จัดการการเปลี่ยนแปลงใน Form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // ลบ error เมื่อผู้ใช้เริ่มพิมพ์
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  console.log("[Users] - usersData:", usersData);
  console.log("[Users] - loading:", loading);
  console.log("[Users] - error:", error);

  if (loading && !users) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>จัดการผู้ใช้งาน</CardTitle>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
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
                เพิ่มผู้ใช้ใหม่
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <Table
                data={usersData}
                autoColumns={false}
                columns={[
                  { key: "email", label: "อีเมล" },
                  { key: "fname", label: "ชื่อ" },
                  { key: "lname", label: "นามสกุล" },
                  { key: "phoneNumber", label: "เบอร์โทรศัพท์" },
                  { key: "createAt", label: "วันที่สมัคร" },
                  { key: "updateAt", label: "อัพเดทล่าสุด" },
                  { key: "status", label: "สถานะ" },
                ]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selectable={true}
                actions={true}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal สำหรับสร้าง/แก้ไข User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="อีเมล"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
              placeholder="example@email.com"
            />

            {!editingUser && (
              <Input
                label="รหัสผ่าน"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password}
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            )}

            <Input
              label="ชื่อ"
              name="fName"
              value={formData.fName}
              onChange={handleInputChange}
              error={formErrors.fName}
              required
              placeholder="ชื่อจริง"
            />

            <Input
              label="นามสกุล"
              name="lName"
              value={formData.lName}
              onChange={handleInputChange}
              error={formErrors.lName}
              required
              placeholder="นามสกุล"
            />

            <Input
              label="เบอร์โทรศัพท์"
              name="phoneNum"
              value={formData.phoneNum}
              onChange={handleInputChange}
              error={formErrors.phoneNum}
              required
              placeholder="0812345678"
            />
          </div>

          <Input
            label="ที่อยู่"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="ที่อยู่ (ไม่บังคับ)"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              เปิดใช้งานบัญชี
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              variant="secondary"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  กำลังบันทึก...
                </>
              ) : editingUser ? (
                "อัพเดท"
              ) : (
                "สร้าง"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal ยืนยันการลบ */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="ยืนยันการลบผู้ใช้"
        message={
          userToDelete
            ? `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${userToDelete.fName} ${userToDelete.lName}" (${userToDelete.email})`
            : "คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้"
        }
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: "", type: "info" })}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermission="users:read">
      <UsersPageContent />
    </ProtectedRoute>
  );
}
