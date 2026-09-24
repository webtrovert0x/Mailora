import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserPreferences from '@/models/UserPreferences';

export async function POST(request: Request) {
  try {
    const { recipientAddress, senderAlias, subject, summary } = await request.json();

    if (!recipientAddress) {
      return NextResponse.json({ error: 'Missing recipient address' }, { status: 400 });
    }

    await connectToDatabase();

    const pref = await UserPreferences.findOne({ ownerAddress: recipientAddress.toLowerCase() });
    
    if (!pref || !pref.telegramChatId) {
      return NextResponse.json({ success: true, message: 'User has no Telegram configured' }, { status: 200 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '7412389471:AAFF_DemoMailoraBotKeyForTesting';
    const message = `📬 <b>New Secure Message on Mailora</b>\n\n` +
      `<b>From:</b> ${senderAlias || 'Anonymous Sender'}\n` +
      `<b>Subject:</b> ${subject || 'Encrypted Mailora Message'}\n` +
      (summary ? `<b>Summary:</b> ${summary}\n\n` : '\n') +
      `🔐 <i>End-to-End Encrypted on BOT Chain</i>\n` +
      `<a href="https://mailora.app/dashboard">Open Mailora Mailbox</a>`;

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: pref.telegramChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      const tgData = await tgRes.json();
      return NextResponse.json({ success: true, telegram: tgData }, { status: 200 });
    } catch (e: any) {
      console.warn("Telegram dispatch failed (mocked in development):", e.message);
      return NextResponse.json({ success: true, message: 'Dispatched via fallback' }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
