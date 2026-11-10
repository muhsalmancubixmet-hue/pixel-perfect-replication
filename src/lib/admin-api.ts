import { apiClient } from './api-client';

export const adminApi = {
  // Executive Dashboard Stats & Analytics
  async getDashboardStats() {
    const res = await apiClient.get('/admin/dashboard/stats/');
    return res.data;
  },

  // Influencers
  async getInfluencers(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/influencers/', { params });
    return res.data;
  },

  async getInfluencerDetail(id: string) {
    const res = await apiClient.get(`/admin/influencers/${id}/`);
    return res.data;
  },

  async moderateInfluencer(id: string, data: { verification_status?: string; status?: string; is_featured?: boolean }) {
    const res = await apiClient.patch(`/admin/influencers/${id}/`, data);
    return res.data;
  },

  async createInfluencer(data: { name: string; handle: string; email: string; category?: string; tier?: string }) {
    const res = await apiClient.post('/admin/influencers/', data);
    return res.data;
  },

  // Businesses
  async getBusinesses(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/businesses/', { params });
    return res.data;
  },

  async getBusinessDetail(id: string) {
    const res = await apiClient.get(`/admin/businesses/${id}/`);
    return res.data;
  },

  async moderateBusiness(id: string, data: { status?: string; verification_status?: string }) {
    const res = await apiClient.patch(`/admin/businesses/${id}/`, data);
    return res.data;
  },

  // Campaigns
  async getCampaigns(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/campaigns/', { params });
    return res.data;
  },

  async getCampaignDetail(id: string) {
    const res = await apiClient.get(`/admin/campaigns/${id}/`);
    return res.data;
  },

  async moderateCampaign(id: string, data: { status?: string; is_featured?: boolean }) {
    const res = await apiClient.patch(`/admin/campaigns/${id}/`, data);
    return res.data;
  },

  // Requirements
  async getRequirements(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/requirements/', { params });
    return res.data;
  },

  async getRequirementDetail(id: string) {
    const res = await apiClient.get(`/admin/requirements/${id}/`);
    return res.data;
  },

  async moderateRequirement(id: string, data: { status: string }) {
    const res = await apiClient.patch(`/admin/requirements/${id}/`, data);
    return res.data;
  },

  // Websites & Custom Domains
  async getWebsites(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/websites/', { params });
    return res.data;
  },

  async getWebsiteDetail(id: string) {
    const res = await apiClient.get(`/admin/websites/${id}/`);
    return res.data;
  },

  async moderateWebsite(id: string, data: { status?: string }) {
    const res = await apiClient.patch(`/admin/websites/${id}/`, data);
    return res.data;
  },

  async getDomains(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/domains/', { params });
    return res.data;
  },

  async verifyDomainDns(id: string, simulated = true) {
    const res = await apiClient.post(`/admin/domains/${id}/verify-dns/`, { simulated });
    return res.data;
  },

  // Taxonomies
  async getTaxonomies() {
    const res = await apiClient.get('/admin/taxonomies/');
    return res.data;
  },

  async getCategories() {
    const res = await apiClient.get('/admin/taxonomies/categories/');
    return res.data;
  },

  async createCategory(data: { name: string; slug?: string; description?: string }) {
    const res = await apiClient.post('/admin/taxonomies/categories/', data);
    return res.data;
  },

  async getLocations(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/taxonomies/locations/', { params });
    return res.data;
  },

  async createLocation(data: { name: string; type: string; parent?: string | undefined; country_code?: string | undefined; latitude?: number | string | undefined; longitude?: number | string | undefined }) {
    const res = await apiClient.post('/admin/taxonomies/locations/', data);
    return res.data;
  },

  async updateLocation(id: string, data: Partial<{ name: string; is_active: boolean }>) {
    const res = await apiClient.patch(`/admin/taxonomies/locations/${id}/`, data);
    return res.data;
  },

  // Creator Deliverable Service Types
  async getServiceTypes(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/service-types/', { params });
    return res.data;
  },

  async createServiceType(data: { name: string; platform?: string; avgPrice?: number | string; avg_price?: number | string; deliverables?: string; deliverables_template?: string; is_active?: boolean }) {
    const res = await apiClient.post('/admin/service-types/', data);
    return res.data;
  },

  async updateServiceType(id: string, data: Partial<{ name: string; platform?: string; avgPrice?: number | string; avg_price?: number | string; deliverables?: string; deliverables_template?: string; is_active?: boolean }>) {
    const res = await apiClient.patch(`/admin/service-types/${id}/`, data);
    return res.data;
  },

  async deleteServiceType(id: string) {
    const res = await apiClient.delete(`/admin/service-types/${id}/`);
    return res.data;
  },

  // Social Platforms
  async getSocialPlatforms() {
    const res = await apiClient.get('/admin/social-platforms/');
    return res.data;
  },

  async createSocialPlatform(data: { name: string; code?: string; color_code?: string; color?: string; supports_oauth?: boolean; supports_api?: boolean; icon_name?: string }) {
    const res = await apiClient.post('/admin/social-platforms/', data);
    return res.data;
  },

  async updateSocialPlatform(id: string, data: Partial<{ is_active?: boolean; supports_oauth?: boolean; supports_api?: boolean; color_code?: string }>) {
    const res = await apiClient.patch(`/admin/social-platforms/${id}/`, data);
    return res.data;
  },

  async getPlatformRequests(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/social-platforms/requests/', { params });
    return res.data;
  },

  async reviewPlatformRequest(id: string, data: { status: string; review_note?: string }) {
    const res = await apiClient.post(`/admin/social-platforms/requests/${id}/review/`, data);
    return res.data;
  },

  // Support
  async getSupportTickets(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/support/tickets/', { params });
    return res.data;
  },

  async getSupportTicketDetail(id: string) {
    const res = await apiClient.get(`/admin/support/tickets/${id}/`);
    return res.data;
  },

  async updateSupportTicket(id: string, data: { status?: string; priority?: string }) {
    const res = await apiClient.patch(`/admin/support/tickets/${id}/`, data);
    return res.data;
  },

  async getSupportTicketMessages(id: string) {
    const res = await apiClient.get(`/admin/support/tickets/${id}/messages/`);
    return res.data;
  },

  async sendSupportTicketMessage(id: string, data: { body: string; is_internal_note?: boolean }) {
    const res = await apiClient.post(`/admin/support/tickets/${id}/messages/`, data);
    return res.data;
  },

  // Billing & Reports
  async getBillingReports() {
    const res = await apiClient.get('/admin/billing/reports/');
    return res.data;
  },

  async getBillingPlans() {
    const res = await apiClient.get('/admin/billing/plans/');
    return res.data;
  },

  async createBillingPlan(data: Record<string, any>) {
    const res = await apiClient.post('/admin/billing/plans/', data);
    return res.data;
  },

  async getPayments(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/billing/payments/', { params });
    return res.data;
  },

  async refundPayment(id: string, data: { refund_amount_cents: number; reason: string }) {
    const res = await apiClient.post(`/admin/billing/payments/${id}/refund/`, data);
    return res.data;
  },

  // Audit Logs & Notifications
  async getAuditLogs(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/audit-logs/', { params });
    return res.data;
  },

  async getNotifications(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/notifications/', { params });
    return res.data;
  },

  async createNotification(data: { title: string; message: string; audience?: string; kind?: string }) {
    const res = await apiClient.post('/admin/notifications/', data);
    return res.data;
  },

  // Settings
  async getSettings() {
    const res = await apiClient.get('/admin/settings/');
    return res.data;
  },

  async updateSetting(key: string, data: { value_json?: any; is_active?: boolean }) {
    const res = await apiClient.patch(`/admin/settings/${key}/`, data);
    return res.data;
  },

  // Staff & RBAC
  async getStaff(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/accounts/staff/', { params });
    return res.data;
  },

  async inviteStaff(data: { email: string; role_template_id: string; first_name?: string; last_name?: string }) {
    const res = await apiClient.post('/admin/accounts/staff/', data);
    return res.data;
  },

  async getRoleTemplates() {
    const res = await apiClient.get('/admin/accounts/role-templates/');
    return res.data;
  },

  async getStaffInvitations() {
    const res = await apiClient.get('/admin/accounts/staff/invitations/');
    return res.data;
  },

  async acceptStaffInvite(data: { token: string; password: string; first_name?: string; last_name?: string }) {
    const res = await apiClient.post('/auth/staff/invite/accept/', data);
    return res.data;
  },

  async revokeStaffInvite(token: string) {
    const res = await apiClient.post('/auth/staff/invite/revoke/', { token });
    return res.data;
  },

  async getVerificationQueue() {
    const res = await apiClient.get('/admin/verification/queue/');
    return res.data;
  },

  // Media Assets (REQ-ADM-02)
  async getMediaAssets(params?: Record<string, string | number | undefined>) {
    const res = await apiClient.get('/admin/media/', { params });
    return res.data;
  },

  async getMediaAssetDetail(id: string) {
    const res = await apiClient.get(`/admin/media/${id}/`);
    return res.data;
  },

  async deleteMediaAsset(id: string) {
    const res = await apiClient.delete(`/admin/media/${id}/`);
    return res.data;
  },
};
