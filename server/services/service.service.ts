import * as serviceModel from '../models/service.model';
import { generateSlug } from '../utils/helpers';

/**
 * Get all available services
 */
export async function getServicesCatalog(): Promise<serviceModel.Service[]> {
  return serviceModel.listAllServices();
}

/**
 * Find service by ID
 */
export async function getServiceDetails(id: number): Promise<serviceModel.Service> {
  const service = await serviceModel.findServiceById(id);
  if (!service) {
    throw { status: 404, message: `Service with ID ${id} not found.` };
  }
  return service;
}

/**
 * Add a new service catalog record (Admin only)
 */
export async function addNewService(serviceData: any): Promise<number> {
  const existingService = await serviceModel.findServiceByCode(serviceData.code);
  if (existingService) {
    throw { status: 400, message: `Service code ${serviceData.code} already exists.` };
  }

  const slug = generateSlug(serviceData.name);
  const existingSlug = await serviceModel.findServiceById(serviceData.id || 0); // basic sanity check
  
  return serviceModel.createService({
    code: serviceData.code,
    name: serviceData.name,
    slug: slug,
    category: serviceData.category,
    description: serviceData.description,
    price: parseFloat(serviceData.price),
    mode: serviceData.mode,
    turnaround_time: serviceData.turnaroundTime,
    is_recurring: serviceData.isRecurring,
    compliance_type: serviceData.complianceType,
    recurring_frequency: serviceData.recurringFrequency,
    standard_due_rule: serviceData.standardDueRule,
    reminder_offsets: serviceData.reminderOffsets,
    documents_required: serviceData.documentsRequired
  });
}

/**
 * Update service details or pricing (Admin only)
 */
export async function updateServiceDetails(id: number, updateData: any): Promise<boolean> {
  const service = await serviceModel.findServiceById(id);
  if (!service) {
    throw { status: 404, message: `Service with ID ${id} not found.` };
  }

  return serviceModel.updateService(id, {
    name: updateData.name,
    category: updateData.category,
    description: updateData.description,
    price: updateData.price !== undefined ? parseFloat(updateData.price) : undefined,
    standard_due_rule: updateData.standardDueRule
  });
}
