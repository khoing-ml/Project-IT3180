const {supabaseAdmin} = require("../config/supabase");

class BillRepository {
    async insert(
        bill
    ) {
        const res = await supabaseAdmin
        .from('bills')
        .insert(bill)
        .select()
        return res
    }

    async update(
        update_field,
        apt_id
    ) {
        const res = await supabaseAdmin
        .from('bills')
        .update(update_field)
        .eq('apt_id', apt_id)
        .select();
        return res;
    }

    async upsert(bill) {
        const res = await supabaseAdmin
        .from('bills')
        .upsert(bill, {onConflict: "apt_id"})
        .select();
        return res;
    }

    async query(apt_id) {
        const res = await supabaseAdmin
        .from('bills')
        .select('*')
        .eq('apt_id', apt_id)
        return res;
    }

    async query_with_range(start, end) {
        const res = await supabaseAdmin
        .from('bills')
        .select('*')
        .order('apt_id', {ascending: false})
        .range(start, end);
        return res 
    }

    async count_all_docs() {
        const res = await supabaseAdmin
        .from('bills')
        .select('*', {count: 'exact', head: true});
        return res 
    }
}


module.exports = {
    BillRepository
};