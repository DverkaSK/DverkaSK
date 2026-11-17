"""Обнуляет анимационные данные неиспользуемых последовательностей в GoldSrc MDL (v10).
Раскладка файла не меняется (все смещения остаются верными), а нули gzip почти не хранит.
Оставляем только последовательности из KEEP (комната берёт кадр 0 у 'idle1', у пропсов — последовательность 0)."""
import struct, gzip, sys

KEEP = {'idle1'}

def offsets(b):
    I = lambda o: struct.unpack_from('<i', b, o)[0]
    names = ['numbones', 'boneindex', 'numbc', 'bcindex', 'numhb', 'hbindex', 'numseq', 'seqindex', 'numseqgroups', 'seqgroupindex',
             'numtex', 'texindex', 'texdata', 'numskinref', 'numskinfam', 'skinindex', 'numbodyparts', 'bodypartindex',
             'numattach', 'attachindex', 'soundtable', 'soundindex', 'soundgroups', 'soundgroupindex', 'numtrans', 'transindex']
    H = {k: I(140 + i * 4) for i, k in enumerate(names)}
    offs = {H[k] for k in names if k.endswith('index') or k == 'texdata'}
    seqs = []
    for i in range(H['numseq']):
        o = H['seqindex'] + i * 176
        name = b[o:o + 32].split(b'\0')[0].decode('latin1')
        numevents, eventindex = I(o + 48), I(o + 52)
        frames, numpivots, pivotindex = I(o + 56), I(o + 60), I(o + 64)
        seqgroup, blends, animindex = I(o + 156), I(o + 120), I(o + 124)
        seqs.append(dict(name=name, frames=frames, blends=blends, animindex=animindex, group=seqgroup))
        offs.update({eventindex, pivotindex, animindex})
    for bp in range(H['numbodyparts']):
        o = H['bodypartindex'] + bp * 76
        nummodels, modelindex = I(o + 64), I(o + 72)
        offs.add(modelindex)
        for m in range(nummodels):
            mo = modelindex + m * 112
            nummesh, meshindex = I(mo + 72), I(mo + 76)
            vertinfo, norminfo, vertindex, normindex, groupindex = I(mo + 84), I(mo + 88), I(mo + 92), I(mo + 96), I(mo + 104)
            offs.update({meshindex, vertinfo, norminfo, vertindex, normindex, groupindex})
            for k in range(nummesh):
                me = meshindex + k * 20
                offs.add(I(me + 4))  # triindex
    if H['numtex']:
        for t in range(H['numtex']):
            offs.add(I(H['texindex'] + t * 80 + 76))  # texture data index
    offs.add(len(b))
    return H, seqs, sorted(o for o in offs if 0 < o <= len(b))

def strip(raw):
    b = bytearray(raw)
    if b[:4] != b'IDST': return raw, 0
    H, seqs, offs = offsets(b)
    if len(seqs) <= 1: return raw, 0
    zeroed = 0
    for s in seqs:
        if s['name'] in KEEP or s['group'] != 0: continue
        start = s['animindex']
        end = next(o for o in offs if o > start)
        b[start:end] = bytes(end - start); zeroed += end - start
    return bytes(b), zeroed

if __name__ == '__main__':
    for f in sys.argv[1:]:
        raw = gzip.decompress(open(f, 'rb').read())
        out, z = strip(raw)
        if z:
            open(f, 'wb').write(gzip.compress(out, 9))
        print(f, len(raw) // 1024, 'KB raw, zeroed', z // 1024, 'KB')
