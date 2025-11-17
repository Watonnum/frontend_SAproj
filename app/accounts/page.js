"use client";

import { useState, useMemo, useEffect } from "react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUsers } from "@/hooks/useUsers";
import { getUserRole } from "@/lib/auth";

function UsersPageContent() {
  const {
    users,
    loading,
    error,
    createUsers,
    updateUsers,
    deleteUsers,
    bulkDeleteUsers,
  } = useUsers();

  // Get current user role directly from localStorage to ensure it's correct
  const [userRole, setUserRole] = useState(() => {
    if (typeof window === "undefined") return null;
    const role = localStorage.getItem("userRole");
    console.log("🔐 [UsersPage] User role from localStorage:", role);
    return role;
  });

  useEffect(() => {
    // Force update from localStorage on mount
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      console.log("🔐 [UsersPage] Updating role from localStorage:", role);
      setUserRole(role);
    }
  }, []);

  // State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // State สำหรับ Search และ Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // State สำหรับ Checkbox Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // State สำหรับ Form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fName: "",
    lName: "",
    address: "",
    phoneNum: "",
    role: "user",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับ Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Filter และ Search users
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        filterRole === "all" || user.role?.toLowerCase() === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

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
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      password: "",
      fName: user.fName || "",
      lName: user.lName || "",
      address: user.address || "",
      phoneNum: user.phoneNum || "",
      role: user.role || "user",
      isActive: user.isActive,
    });
    setFormErrors({});
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  // เปิด Modal ยืนยันการลบ
  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  // เปิด Modal แสดงข้อมูลผู้ใช้
  const handleViewInfo = (user) => {
    setViewingUser(user);
    setIsInfoModalOpen(true);
    setOpenDropdown(null);
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
        role: formData.role,
        isActive: formData.isActive,
      };

      if (!editingUser) {
        userData.passwordHash = formData.password;
        userData.regisDate = new Date();
      } else if (formData.password) {
        userData.passwordHash = formData.password;
      }

      if (editingUser) {
        await updateUsers(editingUser._id, userData);
        showToast("อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว", "success");
      } else {
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
      await deleteUsers(userToDelete._id);
      showToast("ลบผู้ใช้เรียบร้อยแล้ว", "success");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("❌ [UsersPage] Delete error:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  // ลบ Users ที่เลือกแบบ bulk
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await bulkDeleteUsers(selectedUsers);
      showToast(`ลบผู้ใช้ ${selectedUsers.length} คน เรียบร้อยแล้ว`, "success");
      setSelectedUsers([]);
      setIsAllSelected(false);
    } catch (err) {
      console.error("❌ [UsersPage] Bulk delete error:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  // Toggle checkbox สำหรับ user
  const handleCheckboxToggle = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Toggle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
      setIsAllSelected(false);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
      setIsAllSelected(true);
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

  if (loading && !users) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage members and their account</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>

            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter Dropdown */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="operator">Operator</option>
                <option value="user">User</option>
              </select>

              {/* Add User Button - Only for Admin */}
              {userRole === "admin" && (
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Add User
                </button>
              )}
            </div>
          </div>

          {/* Bulk Delete Button - Only for Admin */}
          {userRole === "admin" && selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-visible">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {/* Checkbox header - Only for Admin */}
                  {userRole === "admin" && (
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    User Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Roles
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date Added
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={userRole === "admin" ? "5" : "4"}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      {/* Checkbox column - Only for Admin */}
                      {userRole === "admin" && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleCheckboxToggle(user._id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.fName?.charAt(0).toUpperCase()}
                            {user.lName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.fName} {user.lName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "manager"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "operator"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.regisDate
                          ? new Date(user.regisDate).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === user._id ? null : user._id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu - Permission Based */}
                        {openDropdown === user._id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            {/* Admin: Edit, Information, Delete */}
                            {/* Manager: Information only */}

                            {/* Edit - Admin only */}
                            {userRole === "admin" && (
                              <button
                                onClick={() => handleEdit(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                Edit
                              </button>
                            )}

                            {/* Information - Admin, Manager and Operator */}
                            {(userRole === "admin" ||
                              userRole === "manager" ||
                              userRole === "operator") && (
                              <button
                                onClick={() => handleViewInfo(user)}
                                className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${
                                  userRole === "manager" ||
                                  userRole === "operator"
                                    ? "rounded-lg"
                                    : ""
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Information
                              </button>
                            )}

                            {/* Delete - Admin only */}
                            {userRole === "admin" && (
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

            <Input
              label={editingUser ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required={!editingUser}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บทบาท
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="operator">Operator</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
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
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              เปิดใช้งานบัญชี
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  กำลังบันทึก...
                </>
              ) : editingUser ? (
                "อัพเดท"
              ) : (
                "สร้าง"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal แสดงข้อมูลผู้ใช้ */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setViewingUser(null);
        }}
        title="ข้อมูลผู้ใช้"
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ชื่อ-นามสกุล
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.fName} {viewingUser.lName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  อีเมล
                </label>
                <p className="text-gray-900 mt-1">{viewingUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  เบอร์โทรศัพท์
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.phoneNum || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  บทบาท
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.role?.charAt(0).toUpperCase() +
                    viewingUser.role?.slice(1)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  วันที่สมัคร
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.regisDate
                    ? new Date(viewingUser.regisDate).toLocaleDateString(
                        "th-TH"
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  อัพเดทล่าสุด
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.updateDate
                    ? new Date(viewingUser.updateDate).toLocaleDateString(
                        "th-TH"
                      )
                    : "-"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  ที่อยู่
                </label>
                <p className="text-gray-900 mt-1">
                  {viewingUser.address || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  สถานะ
                </label>
                <p className="text-gray-900 mt-1">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      viewingUser.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewingUser.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
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

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
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
