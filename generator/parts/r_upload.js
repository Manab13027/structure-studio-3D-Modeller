  function upload(batches) {
    const list = [];
    for (const [mname, b] of Object.entries(batches)) {
      const mat = material(mname);
      if (mat.tex) ensureTex(mat.tex);
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const bufs = [];
      [[b.P, 0, 3], [b.N, 1, 3], [b.U, 2, 2]].forEach(([arr, loc, size]) => {
        const buf = gl.createBuffer(); bufs.push(buf); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      });
      list.push({ vao, bufs, count: b.P.length / 3, mat });
    }
    gl.bindVertexArray(null);
    return list;
  }
  const free = list => list.forEach(d => { gl.deleteVertexArray(d.vao); d.bufs.forEach(b => gl.deleteBuffer(b)); });
