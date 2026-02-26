import { supabase } from '../../../lib/supabase';

// ==================== POLLS ====================

export async function fetchPolls(statusFilter) {
    let query = supabase
        .from('polls')
        .select('*, creator:portal_users!created_by(full_name)')
        .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function fetchPollById(id) {
    const { data, error } = await supabase
        .from('polls')
        .select('*, creator:portal_users!created_by(full_name)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function createPoll(pollData, options) {
    const { data: poll, error: pollErr } = await supabase
        .from('polls')
        .insert(pollData)
        .select()
        .single();
    if (pollErr) throw pollErr;

    if (options?.length) {
        const optionRows = options.map((text, i) => ({
            poll_id: poll.id,
            option_text: text,
            sort_order: i,
        }));
        const { error: optErr } = await supabase
            .from('poll_options')
            .insert(optionRows);
        if (optErr) throw optErr;
    }

    return poll;
}

export async function updatePollStatus(id, status) {
    const { error } = await supabase
        .from('polls')
        .update({ status })
        .eq('id', id);
    if (error) throw error;
}

// ==================== OPTIONS ====================

export async function fetchPollOptions(pollId) {
    const { data, error } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('sort_order');
    if (error) throw error;
    return data || [];
}

// ==================== VOTES ====================

export async function fetchVotes(pollId) {
    const { data, error } = await supabase
        .from('poll_votes')
        .select('*, voter:portal_users!voter_id(full_name)')
        .eq('poll_id', pollId);
    if (error) throw error;
    return data || [];
}

export async function submitVote({ pollId, optionId, voterId, voterBlok, voterNik }) {
    // Check if blok already voted
    const { data: existing } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('voter_blok', voterBlok)
        .maybeSingle();

    if (existing) {
        throw new Error('Blok rumah ini sudah memberikan suara. Hanya 1 suara per rumah.');
    }

    const { data, error } = await supabase
        .from('poll_votes')
        .insert({
            poll_id: pollId,
            option_id: optionId,
            voter_id: voterId,
            voter_blok: voterBlok,
            voter_nik: voterNik,
        })
        .select()
        .single();
    if (error) {
        if (error.code === '23505') {
            throw new Error('Blok rumah ini sudah memberikan suara.');
        }
        throw error;
    }
    return data;
}

export async function hasBlokVoted(pollId, blok) {
    const { data } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('voter_blok', blok)
        .maybeSingle();
    return !!data;
}

// ==================== RESULTS ====================

export async function fetchPollResults(pollId) {
    const options = await fetchPollOptions(pollId);
    const votes = await fetchVotes(pollId);

    const totalVotes = votes.length;

    return options.map(opt => {
        const count = votes.filter(v => v.option_id === opt.id).length;
        return {
            ...opt,
            votes: count,
            percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
        };
    });
}

export function getPollStatus(poll) {
    if (poll.status === 'closed' || poll.status === 'cancelled') return poll.status;
    const now = new Date();
    if (new Date(poll.ends_at) < now) return 'closed';
    if (new Date(poll.starts_at) > now) return 'draft';
    return 'active';
}

export function formatDeadline(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d - now;
    if (diff < 0) return 'Sudah berakhir';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days} hari ${hours} jam lagi`;
    return `${hours} jam lagi`;
}
