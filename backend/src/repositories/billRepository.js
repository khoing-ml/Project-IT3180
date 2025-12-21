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

    async query_by_owner(owner, start, end) {
        const res = await supabaseAdmin
        .from('bills')
        .select('*')
        .eq('owner', owner)
        .order('apt_id', {ascending: true})
        .range(start, end);

        return res;
    }

    async count_all_bills_by_owner(owner) {
        const res = await supabaseAdmin
        .from('bills')
        .select('*', {count: 'exact', head: true})
        .eq('owner', owner);

        return res;
    }

    async count_all_docs() {
        const res = await supabaseAdmin
        .from('bills')
        .select('*', {count: 'exact', head: true});
        return res 
    }

    async query_with_filter(filter, start, end) {
        let res = supabaseAdmin
        .from('bills')
        .select('*');

        if(filter) {
            Object.entries(filter).forEach(([key, value]) => {
                res = res.eq(key, value);
            })
        }

        res = res.order('apt_id', {ascending: true}).range(start, end);
        const final = await res;
        return final;
    }

    async count_all_with_filter(filter) {
        let query = supabaseAdmin
        .from('bills')
        .select('*', {count: 'exact', head: true});

        if(filter)
        Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value);
        })

        const res = await query;
        return res;
    }

    async query_all_collected() {
        let res = await supabaseAdmin
        .rpc('get_total_collected')

        return res;
    }

    async accrue_fee(apt_id, total) {
        let res = await supabaseAdmin
        .from('billsCollected')
        .upsert({'apt_id': apt_id, 'total': total})
        .select();
        return res;
    }
}


module.exports = {
    BillRepository
};