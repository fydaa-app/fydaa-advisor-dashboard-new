import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from cookies
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
};

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface DesignationItem {
  level: number;
  hierarchyName: string;
}

export interface EmployeeItem {
  id: number;
  name: string;
}

export interface DesignationOption {
  value: string;
  label: string;
}

export interface EmployeeOption {
  value: string;
  label: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Get designations list
 */
export const getDesignations = async (): Promise<DesignationOption[]> => {
  try {
    const url = `${API_URL}${process.env.NEXT_PUBLIC_DESIGNATION_LIST_ENDPOINT}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken() || ""}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const data: ApiResponse<DesignationItem[]> = await response.json();

    if (data.success && data.data) {
      return data.data.map((item) => ({
        value: item.level.toString(),
        label: item.hierarchyName,
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch designations:", error);
    return [];
  }
};

/**
 * Get employees by designation/role
 */
export const getEmployees = async (role: string): Promise<EmployeeOption[]> => {
  try {
    const url = `${API_URL}${process.env.NEXT_PUBLIC_ROLE_WISE_EMPLOYEE_LIST_ENDPOINT}?role=${role}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken() || ""}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const data: ApiResponse<EmployeeItem[]> = await response.json();

    if (data.success && data.data) {
      return data.data.map((item) => ({
        value: item.id.toString(),
        label: item.name,
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};

/**
 * Reset password (admin - requires old password)
 */
export const resetPassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse<null>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await fetch(`${API_URL}/referrals/reset-password-advisor`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to reset password",
      };
    }

    return {
      success: true,
      message: data.message || "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "Failed to reset password",
    };
  }
};

