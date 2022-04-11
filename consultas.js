const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '',
    database: 'skatepark',
    port: 5432
});

async function nuevoSkater(email,nombre,pass,exp,esp,img){
    try{
        const result = await pool.query(
            `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) 
            values ($1,$2,$3,$4,$5,$6,false) RETURNING *;`,
            [email,nombre,pass,exp,esp,img]
        );
        return result.rows;
    }   catch(e)
    {
        return e;
    }
}

async function getSkater() {
    try {
        const result = await pool.query(`SELECT * FROM skaters`);
        return result.rows;
    }   catch(e) {
        return e;
    }
}

async function editSkater(email, newnombre, newpass, newexp, newesp){
    try {
        const res = await pool.query(
            `UPDATE skaters SET (nombre, password, anos_experiencia, especialidad) = ($2,$3,$4,$5)
            WHERE email = $1 RETURNING*;`,
            [email, newnombre, newpass, newexp, newesp]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function validarSkater(email, estado){
    try {
        const res = await pool.query(
            `UPDATE skaters SET estado = $2
            WHERE email = $1 RETURNING*;`,
            [email, estado]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function deleteSkater(email) {
    try {
        const result = await pool.query(
            `DELETE FROM skaters WHERE email = $1 RETURNING *`,
            [email]
        );
        return result.rowCount;
    }   catch (e) {
        return e
    }
}

module.exports = {
    nuevoSkater,
    getSkater,
    editSkater,
    deleteSkater,
    validarSkater,
}