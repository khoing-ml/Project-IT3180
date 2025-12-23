const { error } = require("console");
const{BillRepository} = require("../repositories/billRepository")
const {PAGE_SIZE} = require("../utils/constants");
const { supabaseAdmin } = require("../config/supabase");

// Helper function to create notifications
const createNotification = async (userId, type, title, message, link = null, metadata = null) => {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error - notifications shouldn't break main functionality
  }
};

// Helper function to get apartment owner's user ID
const getApartmentOwnerUserId = async (apt_id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('apartments')
      .select('owner_id')
      .eq('id', apt_id)
      .single();

    if (error) throw error;
    return data?.owner_id;
  } catch (error) {
    console.error('Error fetching apartment owner:', error);
    return null;
  }
};

// Helper function to notify all clients (users with role 'user')
const notifyAllClients = async (type, title, message, link = null, metadata = null) => {
  try {
    // Get all user profiles with role = 'user' (clients)
    const { data: clients, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'user');

    if (error) throw error;

    if (!clients || clients.length === 0) {
      console.log('No clients found to notify');
      return;
    }

    // Create notifications for all clients
    const notifications = clients.map(client => ({
      user_id: client.id,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error creating bulk notifications:', insertError);
    } else {
      console.log(`Successfully notified ${clients.length} clients`);
    }
  } catch (error) {
    console.error('Error notifying all clients:', error);
  }
};

class BillController {
    repo;
    constructor() {
        this.repo = new BillRepository()
    }

    async insert_new_bill(req, res) {
        try {
            const {
                apt_id,
                owner
            } = req.body;
            if(!apt_id || !owner) {
                throw new Error("No apt_id or owner found!");
            }
            const {data, error} = await this.repo.insert(req.body);
            if(error) {
                throw new Error(error.message);
            }
            
            // Create notification for apartment owner
            const ownerId = await getApartmentOwnerUserId(apt_id);
            if (ownerId) {
              await createNotification(
                ownerId,
                'warning',
                'Hóa đơn mới',
                `Hóa đơn mới cho căn hộ ${apt_id} đã được tạo. Vui lòng thanh toán kịp thời.`,
                '/payments',
                { apt_id, bill_amount: data?.total }
              );
            }
            
            return res.status(200).json({message: "Success!", new_bill: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async update_exist_bill(req, res) {
        try {
            const {apt_id, bill} = req.body;
            if(!apt_id) {
                throw new Error("No apt_id found");
            }
            const {data, error} = await this.repo.update(bill, apt_id);
            if(error) {
                throw new Error(error.message);
            }
            
            // Create notification for apartment owner about bill update
            const ownerId = await getApartmentOwnerUserId(apt_id);
            if (ownerId) {
              await createNotification(
                ownerId,
                'info',
                'Hóa đơn được cập nhật',
                `Hóa đơn của căn hộ ${apt_id} đã được cập nhật. Vui lòng kiểm tra lại.`,
                '/payments',
                { apt_id }
              );
            }
            
            return res.status(200).json({message: "Success!", new_bill: data})
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_a_bill(req, res) {
        try {
            const {apt_id} = req.query;
            const {data, error} = await this.repo.query(apt_id);
            console.log(data);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success!", data: data});
        }
        catch (error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_all_bills(req, res) {
        try {
            let result = {}
            const {
                page_number,
            } = req.query;
            console.log(page_number)
            if(!page_number) {
                throw new Error("No page number found!");
            }
            const start = (page_number - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const { data, error } = await this.repo.query_with_range(start, end);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.current_page = page_number;
            result.page_size = PAGE_SIZE;
            const {count, error: countError} = await this.repo.count_all_docs();
            if(countError) {
                console.warn("Unable to retrieve total document: ", countError.message);
            }
            result.total_docs = count || 0;
            result.total_pages = Math.ceil(result.total_docs / PAGE_SIZE);

            return res.status(200).json({message: "Success", result: result});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    } 


    async query_by_owner(req, res) {
        try {
            let result = {}
            const {
                page_number,
                page_size,
                owner
            } = req.query;
            console.log(page_number)
            if(!page_number || !page_size || !owner ) {
                throw new Error("No page number found!");
            }
            const start = (page_number - 1) * page_size;
            const end = start + page_size - 1;

            const { data, error } = await this.repo.query_by_owner(owner, start, end);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.current_page = page_number;
            result.page_size = page_size;
            const {count, error: countError} = await this.repo.count_all_bills_by_owner(owner);
            if(countError) {
                console.warn("Unable to retrieve total document: ", countError.message);
            }
            result.total_docs = count || 0;
            result.total_pages = Math.ceil(result.total_docs / page_size);

            return res.status(200).json({message: "Success", result: result});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    }

    async query_with_filter(req, res) {
        try {
            let result = {}
            const {
                page_number,
                page_size,
                filter
            } = req.query;
            console.log(filter)
            console.log(page_number)
            if(!page_number || !page_size) {
                throw new Error("No page number found!");
            }
            const start = (page_number - 1) * page_size;
            const end = start + page_size - 1;

            const { data, error } = await this.repo.query_with_filter(filter, start, end);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.current_page = page_number;
            result.page_size = page_size;
            const {count, error: countError} = await this.repo.count_all_with_filter(filter);
            if(countError) {
                console.warn("Unable to retrieve total document: ", countError.message);
            }
            result.total_docs = count || 0;
            result.total_pages = Math.ceil(result.total_docs / page_size);

            return res.status(200).json({message: "Success", result: result});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    }

    async reset(req, res) {
        try {
            const {
                apt_id,
            } = req.body;
            if(!apt_id) {
                throw new Error("No apt_id found!");
            }
            const bill = {
                electric: 0,
                water: 0,
                service: 0,
                vehicles: 0,
                pre_debt: 0
            };
            const {data, error} = await this.repo.update(bill, apt_id);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "ok"});
        } 
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_sum_all(req, res) {
        try {
            const {data, error} = await this.repo.query_all_collected();
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({result: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message})
        }
    }

    async collect_bill(req, res) {
        try {
            const {
                apt_id,
                total
            } = req.body;
            if(!apt_id) {
                throw new Error("No apt found");
            }
            const {data, error} = await this.repo.accrue_fee(apt_id, total);
            if(error) {
                throw new Error(error.message);
            }
            
            // Create success notification for apartment owner
            const ownerId = await getApartmentOwnerUserId(apt_id);
            if (ownerId) {
              await createNotification(
                ownerId,
                'success',
                'Thanh toán hóa đơn thành công',
                `Hóa đơn của căn hộ ${apt_id} đã được thanh toán thành công. Số tiền: ${total?.toLocaleString('vi-VN')}đ`,
                '/payments',
                { apt_id, amount: total }
              );
            }
            
            return res.status(200).json({message: "OK", data: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async setupBills(req, res) {
        try {
            const { period, services } = req.body;
            const userId = req.user?.id; // Assuming auth middleware sets user info

            // Validate input
            if (!period || !services || !Array.isArray(services)) {
                throw new Error("Period and services array are required");
            }

            if (services.length === 0) {
                throw new Error("At least one service must be configured");
            }

            // Validate each service
            services.forEach((service, index) => {
                if (!service.name || service.unit_cost === undefined || service.number_of_units === undefined || !service.unit) {
                    throw new Error(`Service ${index}: name, unit_cost, number_of_units, and unit are required`);
                }
                if (isNaN(service.unit_cost) || service.unit_cost < 0) {
                    throw new Error(`Service ${index}: unit_cost must be a positive number`);
                }
                if (isNaN(service.number_of_units) || service.number_of_units < 0) {
                    throw new Error(`Service ${index}: number_of_units must be a positive number`);
                }
            });

            // Create bill configuration
            const { data, error } = await supabaseAdmin
                .from('bill_configurations')
                .insert({
                    period,
                    services,
                    status: 'draft',
                    created_by: userId,
                })
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return res.status(200).json({
                message: "Bill configuration created successfully",
                data: data
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async publishBillConfiguration(req, res) {
        try {
            const { configId } = req.body;

            if (!configId) {
                throw new Error("Configuration ID is required");
            }

            // Get the configuration
            const { data: config, error: fetchError } = await supabaseAdmin
                .from('bill_configurations')
                .select('*')
                .eq('id', configId)
                .single();

            if (fetchError || !config) {
                throw new Error("Bill configuration not found");
            }

            // Update status to active
            const { data: updatedConfig, error: updateError } = await supabaseAdmin
                .from('bill_configurations')
                .update({
                    status: 'active',
                    published_at: new Date().toISOString()
                })
                .eq('id', configId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Calculate total and create notification message
            const totalAmount = config.services.reduce((sum, service) => {
                return sum + (service.unit_cost * service.number_of_units);
            }, 0);

            const servicesList = config.services
                .map(s => `${s.name}: ${s.unit_cost?.toLocaleString('vi-VN')}đ/${s.unit} × ${s.number_of_units}`)
                .join(', ');

            // Notify all clients about the bill setup
            await notifyAllClients(
                'warning',
                `Cấu hình hóa đơn tháng ${config.period}`,
                `Vui lòng thanh toán hóa đơn tháng ${config.period}. Dịch vụ: ${servicesList}. Tổng tiền: ${totalAmount?.toLocaleString('vi-VN')}đ`,
                '/payments',
                {
                    period: config.period,
                    services: config.services,
                    totalAmount: totalAmount
                }
            );

            return res.status(200).json({
                message: "Bill configuration published and all clients notified",
                data: updatedConfig,
                totalAmount: totalAmount,
                clientsNotified: true
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getBillConfiguration(req, res) {
        try {
            const { configId } = req.params;

            if (!configId) {
                throw new Error("Configuration ID is required");
            }

            const { data, error } = await supabaseAdmin
                .from('bill_configurations')
                .select('*')
                .eq('id', configId)
                .single();

            if (error) {
                throw new Error("Bill configuration not found");
            }

            return res.status(200).json({
                message: "Success",
                data: data
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getAllBillConfigurations(req, res) {
        try {
            const { status } = req.query;
            let query = supabaseAdmin
                .from('bill_configurations')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(error.message);
            }

            return res.status(200).json({
                message: "Success",
                data: data || []
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async updateBillConfiguration(req, res) {
        try {
            const { configId } = req.params;
            const { services, period } = req.body;

            if (!configId) {
                throw new Error("Configuration ID is required");
            }

            // Get the configuration first
            const { data: config, error: fetchError } = await supabaseAdmin
                .from('bill_configurations')
                .select('*')
                .eq('id', configId)
                .single();

            if (fetchError || !config) {
                throw new Error("Bill configuration not found");
            }

            // Only allow updates if status is draft
            if (config.status !== 'draft') {
                throw new Error("Can only update configurations in draft status");
            }

            // Validate services if provided
            if (services && Array.isArray(services)) {
                services.forEach((service, index) => {
                    if (!service.name || service.unit_cost === undefined || service.number_of_units === undefined || !service.unit) {
                        throw new Error(`Service ${index}: name, unit_cost, number_of_units, and unit are required`);
                    }
                });
            }

            const updateData = {};
            if (period) updateData.period = period;
            if (services) updateData.services = services;

            const { data: updatedConfig, error: updateError } = await supabaseAdmin
                .from('bill_configurations')
                .update(updateData)
                .eq('id', configId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            return res.status(200).json({
                message: "Bill configuration updated successfully",
                data: updatedConfig
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async deleteBillConfiguration(req, res) {
        try {
            const { configId } = req.params;

            if (!configId) {
                throw new Error("Configuration ID is required");
            }

            // Get the configuration first
            const { data: config, error: fetchError } = await supabaseAdmin
                .from('bill_configurations')
                .select('status')
                .eq('id', configId)
                .single();

            if (fetchError || !config) {
                throw new Error("Bill configuration not found");
            }

            // Only allow deletion if status is draft
            if (config.status !== 'draft') {
                throw new Error("Can only delete configurations in draft status");
            }

            const { error: deleteError } = await supabaseAdmin
                .from('bill_configurations')
                .delete()
                .eq('id', configId);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            return res.status(200).json({
                message: "Bill configuration deleted successfully"
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = {
    BillController
};