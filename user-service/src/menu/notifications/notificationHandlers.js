export function addNotification(db, receiverId, senderId, type)
{
    const countRow = db.prepare("   SELECT COUNT(*) AS \
                                        notif_count \
                                    FROM \
                                        notifications \
                                    WHERE \
                                        notif_user_id = ?").get(receiverId);
    console.log('Nombre de notif = ', countRow.notif_count);
    const addNotif = db.transaction((receiverId, senderId, type) => 
    {
        if (countRow.notif_count > 20)
        {
            db.prepare("    DELETE FROM \
                               notifications \
                            WHERE \
                                notif_id IN \
                                ( \
                                    SELECT \
                                        notif_id \
                                    FROM \
                                        notifications \
                                    WHERE \
                                        notif_user_id = ? \
                                    ORDER BY \
                                        created_at ASC \
                                    LIMIT 1 \
                               )").run(receiverId);
        }
        db.prepare("    INSERT INTO \
                            notifications (notif_user_id, notif_sender_id, notif_type) \
                        VALUES \
                            (?, ?, ?)").run(receiverId, senderId, type);
    });
    addNotif(receiverId, senderId, type);
}

export function deleteNotification(db, receiverId, senderId, type)
{
    db.prepare("    DELETE FROM \
                        notifications \
                    WHERE \
                        notif_user_id = ? \
                    AND \
                        notif_sender_id = ? \
                    AND \
                        notif_type = ?").run(receiverId, senderId, type);
}