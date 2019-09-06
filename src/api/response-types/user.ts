export class UserAuth {
    account_number: string;
    internal: {
        account_id: number;
        org_id: string;
    };
    type: string;
    user: {
        email: string;
        first_name: string;
        is_active: boolean;
        is_internal: boolean;
        is_org_admin: boolean;
        last_name: string;
        locale: string;
        username: string;
    };
}
