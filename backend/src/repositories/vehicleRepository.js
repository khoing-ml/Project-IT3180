const { execArgv } = require("process");
const {supabaseAdmin} = require("../config/supabase");

class VehicleRepository {
    async insert(new_vehicle) {
        const res = await supabaseAdmin
        .from('vehicles')
        .insert(new_vehicle)
        .select();
        return res
    }

    async delete(vehicle_number) {
        const res = await supabaseAdmin
        .from('vehicles')
        .delete()
        .eq('number', vehicle_number);
        return res;
    }

    async update(new_value, number) {
        const res = await supabaseAdmin
        .from('vehicles')
        .update(new_value)
        .eq('number', number)
        .select();
        return res;
    } 

    async query_vehicles_by_owner(owner) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('owner', owner);
        return res;
    }

    async query_vehicles_by_type_and_owner(type, owner) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('owner', owner)
        .eq('type', type);
        return res;
    }

    async query_vehicles_by_apt(apt_id) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('apt_id', apt_id);
        return res;
    }

     async query_vehicles_by_type_and_apt(type, apt) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('apt_id', apt)
        .eq('type', type);
        return res;
    }

    async query_all_with_type_and_range(start, end, type) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('type', type)
        .order('apt_id', {ascending: false})
        .range(start, end);
        return res 
    }

    async query_all_with_range(start, end) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .order('apt_id', {ascending: false})
        .range(start, end);
        return res 
    }

    async count_all_vehicles() {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*', {count: 'exact', head: true});
        return res;
    }

    async count_all_with_type(type) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*', {count: 'exact', head: true})
        .eq('type', type);
        return res;
    }

    async count_all_with_type_and_owner(type, owner) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*', {count: 'exact', head: true})
        .eq('type', type)
        .eq('owner', owner);
        return res;
    }

    async count_all_with_type_and_apt(type, apt) {
        const res = await supabaseAdmin
        .from('vehicles')
        .select('*', {count: 'exact', head: true})
        .eq('type', type)
        .eq('apt_id', apt);
        return res;
    }

}


module.exports = {
    VehicleRepository
};