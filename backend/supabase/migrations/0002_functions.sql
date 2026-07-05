-- ============================================================
-- Dompet Gacor — RPC functions (atomic money movement)
-- ============================================================

-- ------------------------------------------------------------
-- topup_wallet : tambah saldo (demo/simulasi gateway)
-- Dipanggil dari backend (service_role) ATAU oleh user sendiri.
-- ------------------------------------------------------------
create or replace function public.topup_wallet(
  p_user_id uuid,
  p_amount  numeric,
  p_note    text default 'Top-up'
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_wallet public.wallets;
  v_tx     public.transactions;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  select * into v_wallet from public.wallets where user_id = p_user_id for update;
  if not found then
    raise exception 'WALLET_NOT_FOUND';
  end if;

  update public.wallets
    set balance = balance + p_amount
    where id = v_wallet.id;

  insert into public.transactions (wallet_id, user_id, type, amount, status, note)
  values (v_wallet.id, p_user_id, 'topup', p_amount, 'success', p_note)
  returning * into v_tx;

  return v_tx;
end;
$$;

-- ------------------------------------------------------------
-- transfer_funds : kirim uang antar user, atomic.
-- Mengembalikan transaksi sisi pengirim (transfer_out).
-- ------------------------------------------------------------
create or replace function public.transfer_funds(
  p_sender    uuid,
  p_recipient uuid,
  p_amount    numeric,
  p_note      text default null
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_sender_wallet    public.wallets;
  v_recipient_wallet public.wallets;
  v_ref              text := 'TRX' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  v_out              public.transactions;
begin
  if p_sender = p_recipient then
    raise exception 'SELF_TRANSFER';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Kunci dua wallet dengan urutan deterministik (hindari deadlock)
  if p_sender < p_recipient then
    select * into v_sender_wallet    from public.wallets where user_id = p_sender    for update;
    select * into v_recipient_wallet from public.wallets where user_id = p_recipient for update;
  else
    select * into v_recipient_wallet from public.wallets where user_id = p_recipient for update;
    select * into v_sender_wallet    from public.wallets where user_id = p_sender    for update;
  end if;

  if v_sender_wallet.id is null then raise exception 'SENDER_WALLET_NOT_FOUND'; end if;
  if v_recipient_wallet.id is null then raise exception 'RECIPIENT_NOT_FOUND'; end if;
  if v_sender_wallet.balance < p_amount then raise exception 'INSUFFICIENT_FUNDS'; end if;

  update public.wallets set balance = balance - p_amount where id = v_sender_wallet.id;
  update public.wallets set balance = balance + p_amount where id = v_recipient_wallet.id;

  insert into public.transactions (wallet_id, user_id, type, amount, status, counterparty, note, reference)
  values (v_sender_wallet.id, p_sender, 'transfer_out', p_amount, 'success', p_recipient, p_note, v_ref)
  returning * into v_out;

  insert into public.transactions (wallet_id, user_id, type, amount, status, counterparty, note, reference)
  values (v_recipient_wallet.id, p_recipient, 'transfer_in', p_amount, 'success', p_sender, p_note, v_ref);

  return v_out;
end;
$$;

-- ------------------------------------------------------------
-- pay_qr : pembayaran ke merchant/user via QR (alias transfer + type payment)
-- ------------------------------------------------------------
create or replace function public.pay_qr(
  p_payer     uuid,
  p_payee     uuid,
  p_amount    numeric,
  p_note      text default 'QR Payment'
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_payer_wallet public.wallets;
  v_payee_wallet public.wallets;
  v_ref          text := 'PAY' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  v_tx           public.transactions;
begin
  if p_payer = p_payee then raise exception 'SELF_PAYMENT'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;

  if p_payer < p_payee then
    select * into v_payer_wallet from public.wallets where user_id = p_payer for update;
    select * into v_payee_wallet from public.wallets where user_id = p_payee for update;
  else
    select * into v_payee_wallet from public.wallets where user_id = p_payee for update;
    select * into v_payer_wallet from public.wallets where user_id = p_payer for update;
  end if;

  if v_payer_wallet.id is null then raise exception 'PAYER_WALLET_NOT_FOUND'; end if;
  if v_payee_wallet.id is null then raise exception 'PAYEE_NOT_FOUND'; end if;
  if v_payer_wallet.balance < p_amount then raise exception 'INSUFFICIENT_FUNDS'; end if;

  update public.wallets set balance = balance - p_amount where id = v_payer_wallet.id;
  update public.wallets set balance = balance + p_amount where id = v_payee_wallet.id;

  insert into public.transactions (wallet_id, user_id, type, amount, status, counterparty, note, reference)
  values (v_payer_wallet.id, p_payer, 'payment', p_amount, 'success', p_payee, p_note, v_ref)
  returning * into v_tx;

  insert into public.transactions (wallet_id, user_id, type, amount, status, counterparty, note, reference)
  values (v_payee_wallet.id, p_payee, 'transfer_in', p_amount, 'success', p_payer, p_note, v_ref);

  return v_tx;
end;
$$;

-- Hak akses: user terautentikasi boleh memanggil RPC untuk dirinya sendiri.
-- (Validasi p_sender = auth.uid() dilakukan di layer backend / wrapper.)
revoke all on function public.topup_wallet(uuid,numeric,text)        from public, anon;
revoke all on function public.transfer_funds(uuid,uuid,numeric,text) from public, anon;
revoke all on function public.pay_qr(uuid,uuid,numeric,text)         from public, anon;
grant execute on function public.topup_wallet(uuid,numeric,text)        to authenticated, service_role;
grant execute on function public.transfer_funds(uuid,uuid,numeric,text) to authenticated, service_role;
grant execute on function public.pay_qr(uuid,uuid,numeric,text)         to authenticated, service_role;
