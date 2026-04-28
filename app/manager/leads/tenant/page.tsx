import LeadsPage from '@/components/LeadsPage';
export default function ManagerTenantLeads() {
    return <LeadsPage leadType="tenant" backHref="/manager" title="Tenant Leads (Demand)" role="manager" />;
}
