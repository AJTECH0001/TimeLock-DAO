import UPLCDecoder from ".."


describe("decode program", () => {

    test("pmap", () => {

        console.log(
            UPLCDecoder.parse(
                Buffer.from(
                    "58d058ce0100003232323222253335734666444646464a666ae68cdc3a4000004294454ccd5cd19b87480080085280b1aab9e00235573a0026ea8ccc0248894ccd5cd1aba300113374a90010050992999ab9a300300113374a900019aba037500020162660080066ae88008d5d08009b874815000800ccc015d69bac002001149858dd8a4c46660044444646660106008002600600200466008006004497ac022233574060080046006002464600446600400400246004466004004002444a666aae7c004400c4cc008d5d08009aba200101",
                    "hex"
                )
            )
        );
        
    });

    test.only("must return datum with trace", () => {

        console.log(
            UPLCDecoder.parse(
                Buffer.from(
                    "01000032323232323232323222253335734666444660106644a666ae68004528899ab9c0024a0920441ddc9bdb99c8189e5d195cdd1c9a5b99c00cdc7a44022286c2e4c8c2dcde40786640e0d8ea5ae8e6000046644a666ae68004528899ab9c0024a0920086b6b4b9b9b4b733903230ba3ab6801919192999ab9a3370e90000010991919191919192999ab9a3370e9000001099191980991919192999ab9a3370e9000001099191919192999ab9a3370e9000001099191919192999ab9a3370e90000010a5115333573466e1d200200214a02c6aae78008d55ce8009baa001300148010cc08c8894ccd5cd198139aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50009800a40046603c444a666ae68cc088d5d180119b88001480005854ccd5cd19b87480000044d5d08010998019aba20023370090008008008b1aab9e00235573a0026ea8004cc0548c8c8c94ccd5cd19b87480000084c8c8c8c8c94ccd5cd19b87480000084c8c8c8c8c94ccd5cd19b87480000084c8c8c8c8c94ccd5cd19b87480000085280a999ab9a3370e90010010991919b8f01b001375c60029000198169112999ab9a330313574600466e2000520001615333573466e1d20000011357420042660066ae88008cdc0240020020022c6aae78008d55ce8009baa001300148000cc0a08894ccd5cd198161aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50009800a400066046444a666ae68cc09cd5d180119b88001480005854ccd5cd19b87480000044d5d08010998019aba20023370090008008008b1aab9e00235573a0026ea8004c00520023301e22253335734660446ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400458d55cf0011aab9d00137540020026eb0c00520003301822253335734660386ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400458d55cf0011aab9d001375400266022002002600490011800a400066022444a666ae68cc054d5d180119b88001480005854ccd5cd19b87480000044d5d08010998019aba20023370090008008008b1aab9e00235573a0026ea800400cdd7001000a4c2c466601044446466601260080026006002004660080060044944888cc014c010008c00c004894ccd5cd0010800a50233300622223233300730040013003001002330040030022006222323335734600a00666ae8000c004004c00c0048894ccd55cf80088018998011aba10013574400244646464a666ae68cdc3a400000426464646464a666ae68cdc3a400000426464646464a666ae68cdc3a400000426464646464a666ae68cdc3a400000426464646464a666ae68cdc3a40000042c2a666ae68cdc3a4004004264640026eb8c00520003301c22253335734660406ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400458d55cf0011aab9d0013754002600290001980b9112999ab9a3301b3574600466e2000520001615333573466e1d20000011357420042660066ae88008cdc0240020020022c6aae78008d55ce8009baa001300148000cc0488894ccd5cd1980b1aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50009800a40046601a444a666ae68cc044d5d180119b88001480005854ccd5cd19b87480000044d5d08010998019aba20023370090008008008b1aab9e00235573a0026ea8004c00520003300822253335734660186ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400454ccd5cd19b87480080085858d55cf0011aab9d00137546600600400244646464a666ae68cdc3a4000004266e95200200615333573466e1d2002002132323232325333573466e1d2000002132323232325333573466e1d2000002132323232325333573466e1d200000213232333018222533357346ae8c0044cdd2a4004034264a666ae68c00c0044cdd2a400066ae8000406c4cc01000cd5d10011aba100123232325333573466e1d2000002132323232325333573466e1d2000002132323232325333573466e1d2000002132323371e0020026eb8c00520003302622253335734660546ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400458d55cf0011aab9d001375400260029000198109112999ab9a330253574600466e2000520001615333573466e1d20000011357420042660066ae88008cdc0240020020022c6aae78008d55ce8009baa001300148000cc0708894ccd5cd198101aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50008009bac300148000cc0588894ccd5cd1980d1aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50089bae300148000cc0448894ccd5cd1980a9aba30023371000290000b0a999ab9a3370e900000089aba10021330033574400466e0120010010011635573c0046aae74004dd50009800a400066018444a666ae68cc040d5d180119b88001480005854ccd5cd19b87480000044d5d08010998019aba20023370090008008008b1aab9e00235573a0026ea8004c00520003300722253335734660166ae8c008cdc4000a40002c2a666ae68cdc3a400000226ae840084cc00cd5d100119b804800400400454ccd5cd19b87480100084cdd2a400400c2a666ae68cdc3a400c004266e9520020061635573c0046aae74004dd50009bb14988c8c0088cc0080080048c0088cc008008004894ccd5cd001251100101",
                    "hex"
                ),
                "flat"
            )
        );

    })
})