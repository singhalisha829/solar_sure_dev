import { useEffect, useState } from "react";
import { getRoles, getSalesPersons } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";

export function useSalesPersonsByRole(roleName) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(null);

    useEffect(() => {
        if (!roleName) return;
        const fetch = async () => {
            await requestHandler(
                async () => {
                    const rolesRes = await getRoles();
                    const roles = rolesRes.data.data.output;

                    const matchedRole = roles.find(
                        (role) => role.name?.toLowerCase() === roleName.toLowerCase()
                    );

                    if (!matchedRole) {
                        throw new Error(`Role '${roleName}' not found`);
                    }

                    const salesRes = await getSalesPersons(`${matchedRole.id}`);
                    return salesRes;
                },
                setIsLoading,
                (data) => setData(data.data.output),
                toast.error,
            );            
        };

        fetch();

    }, [roleName]);

    return { data, isLoading };
}