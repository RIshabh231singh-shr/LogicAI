import json
from typing import List, Dict, Any, Tuple, Optional

# Mock Enterprise Database Records
EMPLOYEE_DB = {
    "E101": {"name": "Rishabh Singh", "role": "Senior AI Engineer", "department": "Engineering", "email": "rishabh@cognivault.ai"},
    "E102": {"name": "Jane Doe", "role": "Product Manager", "department": "Product", "email": "jane@cognivault.ai"}
}

LEAVE_DB = {
    "E101": {"employee_id": "E101", "total_annual_leave": 20, "used_leave": 6, "remaining_leave_days": 14},
    "E102": {"employee_id": "E102", "total_annual_leave": 20, "used_leave": 2, "remaining_leave_days": 18}
}

class ToolRegistry:
    """Enterprise Tool Calling Engine managing tool schemas, selection logic, and execution."""
    
    @staticmethod
    def get_employee_details(employee_id: str) -> Dict[str, Any]:
        """Tool 1: Retrieves employee profile details by employee_id."""
        emp = EMPLOYEE_DB.get(employee_id.upper())
        if not emp:
            return {"error": f"Employee ID '{employee_id}' not found in employee directory."}
        return {"success": True, "data": emp}

    @staticmethod
    def get_leave_balance(employee_id: str) -> Dict[str, Any]:
        """Tool 2: Retrieves remaining annual leave balance days for an employee."""
        leave = LEAVE_DB.get(employee_id.upper())
        if not leave:
            return {"error": f"Leave records for employee ID '{employee_id}' not found."}
        return {"success": True, "data": leave}

    @staticmethod
    def search_company_policy(query: str) -> Dict[str, Any]:
        """Tool 3: Searches company policy database for relevant compliance guidelines."""
        policies = {
            "leave": "Full-time employees receive 20 annual leave days.",
            "remote": "Employees may work remotely up to 2 days per week with manager approval.",
            "security": "MFA is required for all access. Passwords expire every 90 days."
        }
        matched = [v for k, v in policies.items() if k in query.lower()]
        return {"success": True, "query": query, "matches": matched if matched else ["No specific matching policy clause found."]}

    def get_tool_schemas(self) -> List[Dict[str, Any]]:
        """Returns JSON Schema definitions for LLM tool selection."""
        return [
            {
                "name": "get_employee_details",
                "description": "Retrieves employee profile, role, department, and contact email.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "employee_id": {"type": "string", "description": "Employee ID (e.g. E101)"}
                    },
                    "required": ["employee_id"]
                }
            },
            {
                "name": "get_leave_balance",
                "description": "Retrieves remaining paid annual leave balance days for an employee.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "employee_id": {"type": "string", "description": "Employee ID (e.g. E101)"}
                    },
                    "required": ["employee_id"]
                }
            },
            {
                "name": "search_company_policy",
                "description": "Searches internal company compliance and HR policy guidelines.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Policy query term (e.g. leave, remote, security)"}
                    },
                    "required": ["query"]
                }
            }
        ]

    def select_tool(self, prompt: str) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Analyzes prompt intent and determines whether a tool call is required.
        Returns: (requires_tool, tool_name, tool_args)
        """
        p_lower = prompt.lower()

        if "leave balance" in p_lower or "how many days" in p_lower or "vacation balance" in p_lower:
            emp_id = "E101" # Default test employee ID if unspecified
            if "e102" in p_lower:
                emp_id = "E102"
            return True, "get_leave_balance", {"employee_id": emp_id}

        if "employee details" in p_lower or "who is" in p_lower or "employee profile" in p_lower:
            emp_id = "E101"
            if "e102" in p_lower:
                emp_id = "E102"
            return True, "get_employee_details", {"employee_id": emp_id}

        if "policy" in p_lower or "company rule" in p_lower or "guideline" in p_lower:
            return True, "search_company_policy", {"query": prompt}

        return False, None, {}

    def execute_tool(self, tool_name: str, tool_args: Dict[str, Any]) -> Dict[str, Any]:
        """Executes selected tool with arguments and returns validated output."""
        if tool_name == "get_employee_details":
            return self.get_employee_details(tool_args.get("employee_id", ""))
        elif tool_name == "get_leave_balance":
            return self.get_leave_balance(tool_args.get("employee_id", ""))
        elif tool_name == "search_company_policy":
            return self.search_company_policy(tool_args.get("query", ""))
        else:
            return {"error": f"Unknown tool '{tool_name}'"}
