class AuditService:
    def log(
        self,
        tx,
        loja_id,
        usuario_id,
        acao,
        modulo,
        entidade_tipo,
        entidade_id,
        origem,
        detalhes=None,
        exigiu_reautenticacao=False,
    ):
        tx.execute(
            """
            insert into auditoria_eventos (
                loja_id, usuario_id, acao, modulo,
                entidade_tipo, entidade_id, detalhes_json,
                origem, exigiu_reautenticacao
            ) values (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s)
            """,
            [
                loja_id,
                usuario_id,
                acao,
                modulo,
                entidade_tipo,
                entidade_id,
                __import__("json").dumps(detalhes or {}),
                origem,
                exigiu_reautenticacao,
            ],
        )
